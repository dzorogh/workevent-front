import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fileStemFromPath, serializeMarkdown } from './markdown.mjs';
import { createAdminClient, loadAdminEnv } from './remote.mjs';

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

  for (const page of pages) {
    if (!page.path) continue;
    writeEntry(`pages/${fileStemFromPath(page.path)}.md`, {
      path: page.path,
      title: page.title ?? '',
      metadata: {
        title: page.metadata?.title ?? undefined,
        h1: page.metadata?.h1 ?? undefined,
        description: page.metadata?.description ?? undefined,
        keywords: page.metadata?.keywords ?? undefined,
        robots: page.metadata?.robots ?? 'index,follow',
        canonicalUrl: page.metadata?.canonical_url ?? page.metadata?.canonicalUrl ?? undefined,
      },
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
