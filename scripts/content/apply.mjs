import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadContentTree } from './markdown.mjs';
import { createAdminClient, loadAdminEnv, withPublicMetadata } from './remote.mjs';
import { planActions, selectEntries } from './sync.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '../..');

export async function applyActions(actions, { dryRun, request }) {
  const summary = { ok: 0, fail: 0, skip: 0, dryRun: 0, rows: [] };

  if (!dryRun) {
    try {
      await request('/api/admin/pages');
    } catch (err) {
      if (err.status === 401 || err.status === 403) throw err;
    }
  }

  for (const action of actions) {
    const key = action.entry.path ?? action.entry.rel;
    if (action.method === 'SKIP') {
      summary.skip += 1;
      summary.rows.push({ key, result: 'SKIP' });
      continue;
    }
    if (action.method === 'FAIL') {
      summary.fail += 1;
      summary.rows.push({ key, result: 'FAIL', error: action.error });
      continue;
    }
    if (dryRun) {
      summary.dryRun += 1;
      summary.rows.push({ key, result: 'DRY', method: action.method, changed: action.changed });
      continue;
    }
    try {
      await request(action.url, { method: action.method, body: action.body });
      summary.ok += 1;
      summary.rows.push({ key, result: 'OK', method: action.method });
    } catch (err) {
      if (err.status === 401 || err.status === 403) throw err;
      if (action.method === 'PUT' && err.status === 404 && action.entry.type === 'page') {
        try {
          await request('/api/admin/pages', {
            method: 'POST',
            body: action.body,
          });
          summary.ok += 1;
          summary.rows.push({ key, result: 'OK', method: 'POST' });
          continue;
        } catch (postErr) {
          if (postErr.status === 401 || postErr.status === 403) throw postErr;
          summary.fail += 1;
          summary.rows.push({ key, result: 'FAIL', error: String(postErr.message) });
          continue;
        }
      }
      summary.fail += 1;
      summary.rows.push({ key, result: 'FAIL', error: String(err.message) });
    }
  }

  return summary;
}

function parseArgs(argv) {
  const only = [];
  let dryRun = false;
  for (const arg of argv) {
    if (arg === '--dry-run') dryRun = true;
    else if (arg.startsWith('--only=')) only.push(arg.slice(7));
  }
  return { only, dryRun };
}

function runLint() {
  const result = spawnSync('node', ['scripts/lint-seo-content.mjs'], {
    cwd: root,
    stdio: 'inherit',
  });
  if (result.status !== 0) {
    throw new Error('content:lint failed; HTTP not called');
  }
}

async function main() {
  const { only, dryRun } = parseArgs(process.argv.slice(2));
  runLint();
  const { baseUrl, token } = loadAdminEnv(root);
  const client = createAdminClient({ baseUrl, token });
  const [pages, posts] = await Promise.all([
    client.listAll('/api/admin/pages'),
    client.listAll('/api/admin/posts'),
  ]);
  const pagesWithMeta = await withPublicMetadata(pages, baseUrl);
  const entries = selectEntries(loadContentTree(resolve(root, 'content')), { only });
  const actions = planActions(entries, { pages: pagesWithMeta, posts });
  const summary = await applyActions(actions, { dryRun, request: client.request });
  for (const row of summary.rows) {
    console.log(`${row.result}\t${row.key}\t${row.method ?? ''}\t${row.changed?.join(',') ?? row.error ?? ''}`);
  }
  if (summary.fail > 0) process.exit(1);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  main().catch((err) => {
    console.error(err.message ?? err);
    process.exit(1);
  });
}
