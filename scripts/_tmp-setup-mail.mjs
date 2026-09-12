#!/usr/bin/env node
/**
 * Move hCaptcha secret to backend env, configure Dokploy SMTP + captcha.
 * Never prints secret values.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { createDecipheriv } from 'node:crypto';
import { WebSocket } from 'ws';

const FRONT_ENV = '/Users/dzorogh/Develop/workevent/workevent-front/.env';
const FRONT_LOCAL = '/Users/dzorogh/Develop/workevent/workevent-front/.env.local';
const BACK_ENV = '/Users/dzorogh/Develop/workevent/workevent-back/.env';
const PREFIX = 'enc:v1:';
const SITEKEY = '20b63706-56ae-4026-877a-7bcceb4c4478';

function parseEnv(raw) {
  const map = new Map();
  const order = [];
  const extras = [];
  for (const line of String(raw || '').split('\n')) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (!m) {
      extras.push({ after: order[order.length - 1] ?? null, line });
      continue;
    }
    if (!map.has(m[1])) order.push(m[1]);
    map.set(m[1], m[2]);
  }
  return { map, order, extras };
}

function serializeEnv(parsed) {
  const lines = [];
  const extrasBy = new Map();
  for (const extra of parsed.extras) {
    const key = extra.after;
    extrasBy.set(key, (extrasBy.get(key) || []).concat(extra.line));
  }
  for (const pre of extrasBy.get(null) || []) lines.push(pre);
  for (const key of parsed.order) {
    lines.push(`${key}=${parsed.map.get(key)}`);
    for (const extra of extrasBy.get(key) || []) lines.push(extra);
  }
  return lines.join('\n').replace(/\n+$/, '\n');
}

function upsertEnv(raw, updates) {
  const parsed = parseEnv(raw);
  for (const [k, v] of Object.entries(updates)) {
    if (!parsed.map.has(k)) parsed.order.push(k);
    parsed.map.set(k, v);
  }
  return parsed.order.map((k) => `${k}=${parsed.map.get(k)}`).join('\n');
}

function loadFileEnv(path) {
  const env = {};
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m) env[m[1]] = m[2];
  }
  return env;
}

const front = parseEnv(readFileSync(FRONT_ENV, 'utf8'));
const back = parseEnv(readFileSync(BACK_ENV, 'utf8'));
const secret =
  front.map.get('HCAPTCHA_SECRET_KEY') ||
  front.map.get('HCAPTCHA_SECRET') ||
  back.map.get('HCAPTCHA_SECRET') ||
  back.map.get('HCAPTCHA_SECRET_KEY');
if (!secret || secret.startsWith('0x0000')) throw new Error('hcaptcha_secret_missing');
console.log(`local_secret prefix=${secret.slice(0, 3)} len=${secret.length}`);

front.map.set('NEXT_PUBLIC_HCAPTCHA_SITEKEY', SITEKEY);
front.map.delete('HCAPTCHA_SECRET_KEY');
front.map.delete('HCAPTCHA_SECRET');
front.order = front.order.filter((k) => k !== 'HCAPTCHA_SECRET_KEY' && k !== 'HCAPTCHA_SECRET');
writeFileSync(FRONT_ENV, serializeEnv(front));
console.log('front.env secret_removed=true sitekey=set');

back.map.set('HCAPTCHA_SITEKEY', SITEKEY);
back.map.set('HCAPTCHA_SECRET', secret);
if (!back.order.includes('HCAPTCHA_SECRET')) back.order.push('HCAPTCHA_SECRET');
writeFileSync(BACK_ENV, serializeEnv(back));
console.log('back.env secret_set=true sitekey=set');

const localEnv = loadFileEnv(FRONT_LOCAL);
const baseUrl = localEnv.DOCKPLOY_URL.replace(/\/$/, '');
const apiKey = localEnv.DOCKPLOY_API_KEY;

async function api(path, init) {
  const res = await fetch(`${baseUrl}/api/${path}`, {
    headers: { 'x-api-key': apiKey, accept: 'application/json', 'content-type': 'application/json' },
    ...init,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${path}: ${res.status} ${text.slice(0, 400)}`);
  try { return JSON.parse(text); } catch { return text; }
}

function runCommand(containerId, command, timeoutMs = 20000) {
  const wsUrl = new URL('/docker-container-terminal', baseUrl);
  wsUrl.protocol = wsUrl.protocol === 'https:' ? 'wss:' : 'ws:';
  wsUrl.searchParams.set('containerId', containerId);
  wsUrl.searchParams.set('activeWay', 'sh');
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl.toString(), { headers: { 'x-api-key': apiKey } });
    let output = '';
    let settled = false;
    const timer = setTimeout(() => { if (!settled) { settled = true; ws.close(); resolve(output); } }, timeoutMs);
    ws.on('open', () => { ws.send(`${command}\n`); setTimeout(() => ws.send('exit\n'), 800); });
    ws.on('message', (data) => { output += data.toString(); });
    ws.on('error', reject);
    ws.on('close', () => { if (!settled) { settled = true; clearTimeout(timer); resolve(output); } });
  });
}

function decrypt(value, hexKey) {
  if (!value) return null;
  if (!value.startsWith(PREFIX)) return value;
  const key = Buffer.from(hexKey, 'hex');
  const parts = value.slice(PREFIX.length).split(':');
  if (parts.length !== 3) return null;
  const [ivHex, tagHex, ctHex] = parts;
  const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(ivHex, 'hex'));
  decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
  return decipher.update(Buffer.from(ctHex, 'hex')) + decipher.final('utf8');
}

const compose = await api('compose.one?composeId=qBU_O8nSRYsD87zR2iB0e');
const composeEnv = parseEnv(compose.env).map;
if (!composeEnv.get('ENCRYPTION_KEY')) throw new Error('MailFlow ENCRYPTION_KEY missing');

const containers = await api('docker.getContainers');
const pg = containers.find((c) => c.state === 'running' && /compose-compress-solid-state-firewall-2vgju3-postgres-1/.test(c.name || ''));
if (!pg?.containerId) throw new Error('MailFlow postgres not found');

await runCommand(pg.containerId, `printf '%s\\n' "COPY (SELECT email_address,auth_user,auth_pass,smtp_host,smtp_port FROM email_accounts WHERE email_address='dzorogh@gmail.com') TO STDOUT WITH CSV" > /tmp/q.sql`);
const rawOut = await runCommand(pg.containerId, `PAGER=cat psql -U mailflow -d mailflow -t -A -P pager=off -f /tmp/q.sql`);
const clean = rawOut.replace(/\x1b\[[0-9;]*[A-Za-z]/g, '');
const line = clean.split(/\r?\n/).map((l) => l.trim()).find((l) => l.startsWith('dzorogh@gmail.com,'));
if (!line) throw new Error('Gmail row not found');
const fields = [];
let cur = '';
let inQ = false;
for (const ch of line) {
  if (ch === '"') { inQ = !inQ; continue; }
  if (ch === ',' && !inQ) { fields.push(cur); cur = ''; continue; }
  cur += ch;
}
fields.push(cur);
const [, authUser, authPass, smtpHost, smtpPort] = fields;
const password = decrypt(authPass, composeEnv.get('ENCRYPTION_KEY'));
if (!password) throw new Error('decrypt_failed');

const backendUpdates = {
  MAIL_MAILER: 'smtp',
  MAIL_HOST: smtpHost || 'smtp.gmail.com',
  MAIL_PORT: String(smtpPort || '587'),
  MAIL_ENCRYPTION: 'tls',
  MAIL_USERNAME: authUser || 'dzorogh@gmail.com',
  MAIL_PASSWORD: password,
  MAIL_FROM_ADDRESS: 'dzorogh@gmail.com',
  MAIL_FROM_NAME: 'Workevent',
  EVENT_SUBMISSION_NOTIFY_EMAIL: 'dzorogh@gmail.com',
  HCAPTCHA_SITEKEY: SITEKEY,
  HCAPTCHA_SECRET: secret,
};

async function saveEnv(applicationId, updates) {
  const app = await api(`application.one?applicationId=${applicationId}`);
  const payload = {
    applicationId,
    env: upsertEnv(app.env, updates),
    buildArgs: app.buildArgs ?? '',
    buildSecrets: app.buildSecrets ?? '',
    createEnvFile: app.createEnvFile ?? true,
  };
  await api('application.saveEnvironment', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return api(`application.one?applicationId=${applicationId}`);
}

const appIds = {
  'workevent-app': 'VkZwL9mRpyxjmuzh8Hrn1',
  horizon: 'qgVKyrcdnk9XnkrU4qqrL',
  scheduler: 'HCLV3c-pfKCk17cJ0P_Dg',
};

for (const [name, applicationId] of Object.entries(appIds)) {
  const check = await saveEnv(applicationId, backendUpdates);
  const env = String(check.env);
  console.log(`saved ${name}`, {
    smtp: env.includes('MAIL_MAILER=smtp'),
    notify: env.includes('EVENT_SUBMISSION_NOTIFY_EMAIL='),
    sitekey: env.includes(`HCAPTCHA_SITEKEY=${SITEKEY}`),
    secret: /HCAPTCHA_SECRET=.+/.test(env) && !env.includes('HCAPTCHA_SECRET=0x0000'),
  });
}

const frontApp = await saveEnv('IQQ42qsJho58Cu3w1ZJAX', {
  NEXT_PUBLIC_HCAPTCHA_SITEKEY: SITEKEY,
});
console.log('saved front', {
  sitekey: String(frontApp.env).includes(`NEXT_PUBLIC_HCAPTCHA_SITEKEY=${SITEKEY}`),
  no_secret: !String(frontApp.env).includes('HCAPTCHA_SECRET'),
});

console.log('done');
