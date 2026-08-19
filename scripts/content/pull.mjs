import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fileStemFromPath, serializeMarkdown } from './markdown.mjs';
import { createAdminClient, loadAdminEnv, withPublicMetadata } from './remote.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '../..');

function writeEntry(rel, entry) {
  const full = resolve(root, 'content', rel);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, serializeMarkdown(entry));
  console.log(`WROTE content/${rel}`);
}

async function main() {
  const { baseUrl, token } = loadAdminEnv(root);
  const client = createAdminClient({ baseUrl, token });
  const [pages, posts] = await Promise.all([
    client.listAll('/api/admin/pages'),
    client.listAll('/api/admin/posts'),
  ]);
  const pagesWithMeta = await withPublicMetadata(pages, baseUrl);

  for (const page of pagesWithMeta) {
    if (!page.path) continue;
    writeEntry(`pages/${fileStemFromPath(page.path)}.md`, {
      path: page.path,
      title: page.title ?? '',
      metadata: page.metadata,
      body: page.content ?? '',
    });
  }

  for (const post of posts) {
    writeEntry(`posts/${post.id}.md`, {
      id: post.id,
      title: post.title ?? '',
      metadata: {},
      body: post.content ?? '',
    });
  }
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
