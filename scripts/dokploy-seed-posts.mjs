#!/usr/bin/env node
/**
 * @deprecated Use content/*.md and npm run content:apply. This script is a fallback only.
 *
 * Copy seed-seo-posts.php + seo/posts-seed.json into the Laravel container and upsert posts.
 *
 *   npm run seo:seed-posts
 *   node scripts/dokploy-seed-posts.mjs
 */

import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { WebSocket } from 'ws';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

function loadEnv() {
  const env = {};
  const raw = readFileSync(resolve(root, '.env.local'), 'utf8');
  for (const line of raw.split('\n')) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m) env[m[1]] = m[2];
  }
  return env;
}

async function dokployFetch(baseUrl, apiKey, path) {
  const res = await fetch(`${baseUrl.replace(/\/$/, '')}/api/${path}`, {
    headers: { 'x-api-key': apiKey, accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`Dokploy API ${path}: ${res.status} ${await res.text()}`);
  return res.json();
}

function pickBackendApp(containers) {
  const running = containers.filter((c) => c.state === 'running');
  return (
    running.find((c) => /workevent-backend-.+-app-1$/.test(c.name || '')) ??
    running.find((c) => c.name?.includes('workevent-backend') && c.name?.includes('-app-'))
  );
}

function runInContainer({ baseUrl, apiKey, containerId, command, timeoutMs = 180000 }) {
  const wsUrl = new URL('/docker-container-terminal', baseUrl.replace(/\/$/, ''));
  wsUrl.protocol = wsUrl.protocol === 'https:' ? 'wss:' : 'ws:';
  wsUrl.searchParams.set('containerId', containerId);
  wsUrl.searchParams.set('activeWay', 'bash');

  return new Promise((resolveP, reject) => {
    const ws = new WebSocket(wsUrl.toString(), { headers: { 'x-api-key': apiKey } });
    let output = '';
    let settled = false;
    const finish = (err) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      ws.close();
      if (err) reject(err);
      else resolveP(output);
    };
    const timer = setTimeout(() => finish(), timeoutMs);

    ws.on('open', () => {
      ws.send(`${command}\n`);
      setTimeout(() => ws.send('exit\n'), 1200);
    });
    ws.on('message', (data) => {
      output += data.toString();
      if (output.includes('__SEED_DONE__')) finish();
    });
    ws.on('error', (err) => finish(err));
    ws.on('close', () => finish());
  });
}

async function main() {
  const env = loadEnv();
  const apiKey = env.DOCKPLOY_API_KEY;
  const baseUrl = env.DOCKPLOY_URL;
  if (!apiKey || !baseUrl) {
    console.error('Set DOCKPLOY_API_KEY and DOCKPLOY_URL in .env.local');
    process.exit(1);
  }

  const containers = await dokployFetch(baseUrl, apiKey, 'docker.getContainers');
  const app = pickBackendApp(containers);
  if (!app?.containerId) {
    throw new Error('No running workevent-backend-*-app-1 container');
  }
  process.stderr.write(`Container ${app.name}\n`);

  const phpB64 = readFileSync(resolve(root, 'scripts/seed-seo-posts.php')).toString('base64');
  const jsonB64 = readFileSync(resolve(root, 'seo/posts-seed.json')).toString('base64');

  const putB64 = (remotePath, b64) => {
    const chunks = b64.match(/.{1,1200}/g) ?? [];
    return [
      `rm -f ${remotePath} ${remotePath}.b64`,
      ...chunks.map((chunk) => `printf '%s' '${chunk}' >> ${remotePath}.b64`),
      `base64 -d ${remotePath}.b64 > ${remotePath}`,
      `rm -f ${remotePath}.b64`,
    ];
  };

  const command = [
    ...putB64('/tmp/seed-seo-posts.php', phpB64),
    ...putB64('/tmp/posts-seed.json', jsonB64),
    'LARAVEL_ROOT=/var/www/html php /tmp/seed-seo-posts.php /tmp/posts-seed.json',
    'echo __SEED_DONE__',
  ].join(' && ');

  const output = await runInContainer({
    baseUrl,
    apiKey,
    containerId: app.containerId,
    command,
  });
  process.stdout.write(output.replace(/\r/g, ''));

  if (!/Done\. Upserted \d+ posts/.test(output)) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
