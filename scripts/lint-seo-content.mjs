#!/usr/bin/env node
/**
 * Lint content copy for machine-voice phrases. Not GPTZero / «AI %».
 *
 *   npm run content:lint
 *   npm run seo:lint-content
 *   node scripts/lint-seo-content.mjs content/pages/home.md
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

function walkMd(dir, acc = []) {
  let names = [];
  try {
    names = readdirSync(dir);
  } catch {
    return acc;
  }
  for (const name of names) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walkMd(full, acc);
    else if (name.endsWith('.md')) acc.push(full);
  }
  return acc;
}

const DEFAULT_FILES = walkMd(resolve(root, 'content'));

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

const requested = process.argv.slice(2);
const files = (requested.length ? requested : DEFAULT_FILES)
  .map((f) => resolve(root, f))
  .filter((f) => existsSync(f));

if (files.length === 0 && requested.length > 0) {
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
  console.error(`content:lint failed: ${hits} hit(s). Rewrite, do not publish.`);
  process.exit(1);
}

console.log(`content:lint ok (${files.length} file(s))`);
