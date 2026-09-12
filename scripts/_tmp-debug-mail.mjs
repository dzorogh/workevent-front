#!/usr/bin/env node
import { readFileSync } from 'node:fs';

const env = {};
for (const line of readFileSync('/Users/dzorogh/Develop/workevent/workevent-front/.env.local', 'utf8').split('\n')) {
  const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
  if (m) env[m[1]] = m[2];
}

const baseUrl = env.DOCKPLOY_URL.replace(/\/$/, '');
const apiKey = env.DOCKPLOY_API_KEY;
const applicationId = 'VkZwL9mRpyxjmuzh8Hrn1';

const res = await fetch(`${baseUrl}/api/application.one?applicationId=${applicationId}`, {
  headers: { 'x-api-key': apiKey, accept: 'application/json' },
});
const app = await res.json();
const keys = Object.keys(app).sort();
const envKeys = String(app.env || '')
  .split('\n')
  .map((l) => l.split('=')[0])
  .filter(Boolean);
console.log('fields', keys);
console.log('env_keys', envKeys);
console.log('buildArgs_type', typeof app.buildArgs, 'len', String(app.buildArgs ?? '').length);
console.log('buildSecrets_type', typeof app.buildSecrets, 'len', String(app.buildSecrets ?? '').length);
console.log('has_mail_smtp', String(app.env || '').includes('MAIL_MAILER=smtp'));
console.log('has_hcaptcha', String(app.env || '').includes('HCAPTCHA_'));
console.log('has_notify', String(app.env || '').includes('EVENT_SUBMISSION_NOTIFY'));
