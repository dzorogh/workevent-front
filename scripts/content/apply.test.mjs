import test from 'node:test';
import assert from 'node:assert/strict';
import { applyActions } from './apply.mjs';

test('applyActions dry-run does not fetch writes', async () => {
  const calls = [];
  const fetchImpl = async (url, init) => {
    calls.push({ url, method: init?.method ?? 'GET' });
    return { ok: true, status: 200, json: async () => ({}) };
  };

  const summary = await applyActions(
    [
      {
        method: 'PUT',
        url: '/api/admin/pages/9',
        body: { title: 'X' },
        entry: { rel: 'pages/home.md', path: '/' },
        changed: ['title'],
      },
    ],
    { dryRun: true, fetchImpl, request: async () => ({}) },
  );

  assert.equal(summary.dryRun, 1);
  assert.equal(calls.length, 0);
});

test('applyActions stops before writes on 401', async () => {
  await assert.rejects(
    () =>
      applyActions(
        [{ method: 'POST', url: '/api/admin/pages', body: {}, entry: { rel: 'pages/home.md' } }],
        {
          dryRun: false,
          request: async () => {
            const err = new Error('Admin API 401. Create a token in Filament and set ADMIN_API_TOKEN in .env.local');
            err.status = 401;
            throw err;
          },
        },
      ),
    /ADMIN_API_TOKEN/,
  );
});

test('applyActions continues after 422 and exits with fail', async () => {
  const methods = [];
  const summary = await applyActions(
    [
      {
        method: 'PUT',
        url: '/api/admin/pages/1',
        body: {},
        entry: { rel: 'pages/a.md', path: '/a' },
      },
      {
        method: 'PUT',
        url: '/api/admin/pages/2',
        body: {},
        entry: { rel: 'pages/b.md', path: '/b' },
      },
    ],
    {
      dryRun: false,
      request: async (url) => {
        methods.push(url);
        if (url.endsWith('/1')) {
          const err = new Error('422');
          err.status = 422;
          throw err;
        }
        return { id: 2 };
      },
    },
  );

  assert.equal(summary.fail, 1);
  assert.equal(summary.ok, 1);
  assert.equal(methods.length, 3);
});
