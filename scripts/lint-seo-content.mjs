#!/usr/bin/env node
/**
 * Lint SEO copy for machine-voice phrases. Not GPTZero / «AI %».
 *
 *   npm run seo:lint-content
 *   node scripts/lint-seo-content.mjs seo/posts-seed.json
 */

import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const DEFAULT_FILES = [
  'seo/posts-seed.json',
  'scripts/seed-seo-posts.php',
  'scripts/seed-seo-pages.php',
];

const FORBIDDEN = [
  { id: 'meta-page-assembled', re: /страница собрана/i },
  { id: 'meta-this-material', re: /этот материал/i },
  { id: 'meta-this-text', re: /данный текст/i },
  { id: 'meta-not-overview', re: /не под общий обзор/i },
  { id: 'meta-answers-query', re: /отвечает на запрос/i },
  { id: 'cliche-modern-world', re: /в современном мире/i },
  { id: 'cliche-lets-review', re: /давайте разберём/i },
  { id: 'not-just-but', re: /не просто\s+.+\s+а\s+/i },
];

const files = (process.argv.slice(2).length ? process.argv.slice(2) : DEFAULT_FILES)
  .map((f) => resolve(root, f))
  .filter((f) => existsSync(f));

if (files.length === 0) {
  console.error('No files to lint.');
  process.exit(1);
}

let hits = 0;
for (const file of files) {
  const text = readFileSync(file, 'utf8');
  const lines = text.split('\n');
  for (const rule of FORBIDDEN) {
    lines.forEach((line, idx) => {
      if (rule.re.test(line)) {
        hits += 1;
        console.error(`${file}:${idx + 1} [${rule.id}] ${line.trim().slice(0, 160)}`);
      }
    });
  }
}

if (hits > 0) {
  console.error(`seo:lint-content failed: ${hits} hit(s). Rewrite, do not publish.`);
  process.exit(1);
}

console.log(`seo:lint-content ok (${files.length} file(s))`);
