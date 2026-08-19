import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export function loadAdminEnv(root) {
  const env = { ...process.env };
  try {
    for (const line of readFileSync(resolve(root, '.env.local'), 'utf8').split('\n')) {
      const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
      if (m) env[m[1]] = m[2];
    }
  } catch {
    // .env.local optional if vars already exported
  }

  const baseUrl = (env.ADMIN_API_URL ?? '').replace(/\/$/, '');
  const token = env.ADMIN_API_TOKEN ?? '';
  if (!baseUrl) {
    throw new Error('Set ADMIN_API_URL in .env.local (origin only, no /api)');
  }
  if (!token) {
    throw new Error('Create a token in Filament and set ADMIN_API_TOKEN in .env.local');
  }
  if (baseUrl.endsWith('/api') || baseUrl.endsWith('/api/v1')) {
    throw new Error('ADMIN_API_URL must be the origin only, without /api');
  }

  return { baseUrl, token };
}

export function createAdminClient({ baseUrl, token, fetchImpl = fetch }) {
  async function request(path, { method = 'GET', body } = {}) {
    const res = await fetchImpl(`${baseUrl}${path}`, {
      method,
      headers: {
        accept: 'application/json',
        authorization: `Bearer ${token}`,
        ...(body ? { 'content-type': 'application/json' } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (res.status === 401 || res.status === 403) {
      const err = new Error('Admin API 401/403. Create a token in Filament and set ADMIN_API_TOKEN in .env.local');
      err.status = res.status;
      throw err;
    }

    if (!res.ok) {
      const err = new Error(`Admin API ${res.status}`);
      err.status = res.status;
      throw err;
    }

    return res.status === 204 ? null : res.json();
  }

  async function listAll(path) {
    const items = [];
    let page = 1;
    let lastPage = 1;
    do {
      const json = await request(`${path}${path.includes('?') ? '&' : '?'}page=${page}`);
      const chunk = json.data ?? json;
      if (Array.isArray(chunk)) items.push(...chunk);
      lastPage = json.meta?.last_page ?? json.last_page ?? 1;
      page += 1;
    } while (page <= lastPage);
    return items;
  }

  return { request, listAll };
}
