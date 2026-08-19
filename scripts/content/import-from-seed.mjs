import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import slugify from 'slugify';
import { fileStemFromPath, serializeMarkdown } from './markdown.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '../..');

function citySlug(title, id) {
  slugify.extend({ й: 'y', Й: 'Й' });
  return `${slugify(title, {
    lower: true,
    replacement: '-',
    trim: true,
    strict: true,
    locale: 'ru',
  }).slice(0, 60)}-${id}`;
}

function loadEnv() {
  const env = { ...process.env };
  try {
    for (const line of readFileSync(resolve(root, '.env.local'), 'utf8').split('\n')) {
      const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
      if (m) env[m[1]] = m[2];
    }
  } catch {
    // optional
  }
  return env;
}

function write(rel, entry) {
  const full = resolve(root, 'content', rel);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, serializeMarkdown(entry));
}

async function main() {
  const env = loadEnv();
  const origin = (env.ADMIN_API_URL || env.NEXT_PUBLIC_API_URL || 'https://admin.workevent.ru')
    .replace(/\/$/, '')
    .replace(/\/api$/, '');
  const citiesRes = await fetch(`${origin}/api/v1/cities`);
  if (!citiesRes.ok) throw new Error(`GET /v1/cities ${citiesRes.status}`);
  const citiesJson = await citiesRes.json();
  const cities = new Map((citiesJson.data ?? []).map((c) => [c.title, c]));

  const pagesSeed = JSON.parse(readFileSync(resolve(root, 'seo/pages-seed-priority.json'), 'utf8'));
  for (const page of pagesSeed.pages ?? []) {
    let path = page.path;
    if (page.type === 'city') {
      const city = cities.get(page.cityTitle);
      if (!city) {
        console.error(`SKIP city (not in API): ${page.cityTitle}`);
        continue;
      }
      path = `/city/${citySlug(city.title, city.id)}`;
    }
    if (!path) {
      console.error('SKIP page without path');
      continue;
    }
    write(`pages/${fileStemFromPath(path)}.md`, {
      path,
      title: page.title,
      metadata: page.metadata ?? {},
      body: page.content ?? '',
    });
  }

  write('pages/home.md', {
    path: '/',
    title: 'Каталог деловых мероприятий',
    metadata: {
      title: 'Деловые мероприятия — каталог конференций и выставок | Workevent',
      h1: 'Деловые мероприятия',
      description: 'Каталог деловых мероприятий: конференции, форумы и выставки по датам, городам и отраслям.',
      robots: 'index,follow',
    },
    body: '',
  });

  const postsSeed = JSON.parse(readFileSync(resolve(root, 'seo/posts-seed.json'), 'utf8'));
  let i = 0;
  for (const post of postsSeed.posts ?? []) {
    i += 1;
    write(`posts/new-${i}.md`, {
      title: post.title,
      metadata: {},
      body: post.content ?? '',
    });
  }
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
