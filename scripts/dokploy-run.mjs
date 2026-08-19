#!/usr/bin/env node
/**
 * Run a one-off shell command in a Dokploy container (non-interactive).
 *
 * Usage:
 *   node scripts/dokploy-run.mjs --app backend -- 'php artisan --version'
 *   node scripts/dokploy-run.mjs --app backend -- 'php scripts/seed-seo-pages.php'
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

function parseArgs(argv) {
  const sep = argv.indexOf('--');
  const flags = sep >= 0 ? argv.slice(0, sep) : argv;
  const command = sep >= 0 ? argv.slice(sep + 1).join(' ') : 'echo ok';
  const args = { app: 'backend', shell: 'bash', command };
  for (let i = 0; i < flags.length; i++) {
    if (flags[i] === '--app' && flags[i + 1]) args.app = flags[++i];
    else if (flags[i] === '--shell' && flags[i + 1]) args.shell = flags[++i];
  }
  return args;
}

async function dokployFetch(baseUrl, apiKey, path) {
  const res = await fetch(`${baseUrl.replace(/\/$/, '')}/api/${path}`, {
    headers: { 'x-api-key': apiKey, accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`Dokploy API ${path}: ${res.status} ${await res.text()}`);
  return res.json();
}

async function resolveContainerId(baseUrl, apiKey, appName) {
  const containers = await dokployFetch(baseUrl, apiKey, 'docker.getContainers');
  const running = containers.filter(
    (c) => c.state === 'running' && c.name?.includes(appName),
  );
  if (running[0]?.containerId) return running[0].containerId;

  const tasks = await dokployFetch(
    baseUrl,
    apiKey,
    `docker.getServiceContainersByAppName?appName=${encodeURIComponent(appName)}`,
  );
  const active = tasks.find((t) => t.state === 'running') ?? tasks[0];
  if (active?.containerId) return active.containerId;

  throw new Error(`No container found for ${appName}`);
}

function runCommand({ baseUrl, apiKey, containerId, shell, command, timeoutMs = 120000 }) {
  const wsUrl = new URL('/docker-container-terminal', baseUrl.replace(/\/$/, ''));
  wsUrl.protocol = wsUrl.protocol === 'https:' ? 'wss:' : 'ws:';
  wsUrl.searchParams.set('containerId', containerId);
  wsUrl.searchParams.set('activeWay', shell);

  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl.toString(), { headers: { 'x-api-key': apiKey } });
    let output = '';
    let settled = false;
    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        ws.close();
        resolve(output);
      }
    }, timeoutMs);

    ws.on('open', () => {
      ws.send(`${command}\n`);
      ws.send('exit\n');
    });

    ws.on('message', (data) => {
      output += data.toString();
    });

    ws.on('error', (err) => {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        reject(err);
      }
    });

    ws.on('close', () => {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        resolve(output);
      }
    });
  });
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const env = loadEnv();
  const apiKey = env.DOCKPLOY_API_KEY;
  const baseUrl = env.DOCKPLOY_URL;
  const appName =
    args.app === 'frontend'
      ? env.DOCKPLOY_FRONTEND_APP_NAME
      : env.DOCKPLOY_BACKEND_APP_NAME;

  const containerId = await resolveContainerId(baseUrl, apiKey, appName);
  process.stderr.write(`Container ${containerId}\n`);
  const output = await runCommand({ baseUrl, apiKey, containerId, shell: args.shell, command: args.command });
  process.stdout.write(output.replace(/\r/g, ''));
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
