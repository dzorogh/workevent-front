import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import yaml from 'js-yaml';

const FRONTMATTER = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/;

export function parseMarkdown(source, { type } = {}) {
  const match = source.match(FRONTMATTER);
  if (!match) {
    throw new Error('Missing YAML frontmatter');
  }

  const data = yaml.load(match[1]) ?? {};
  const body = match[2].replace(/^\s+/, '').replace(/\s+$/, '');
  const inferred = type ?? (data.path ? 'page' : 'post');

  return {
    type: inferred,
    id: data.id,
    path: data.path,
    title: data.title ?? '',
    metadata: data.metadata ?? {},
    body,
  };
}

export function serializeMarkdown(entry) {
  const front = {
    ...(entry.id != null ? { id: entry.id } : {}),
    ...(entry.path != null ? { path: entry.path } : {}),
    title: entry.title,
    ...(entry.metadata && Object.keys(entry.metadata).length > 0
      ? { metadata: entry.metadata }
      : {}),
  };

  return `---\n${yaml.dump(front, { lineWidth: 120 }).trim()}\n---\n\n${entry.body}\n`;
}

export function fileStemFromPath(path) {
  if (path === '/') return 'home';
  return path.replace(/^\//, '').replaceAll('/', '-');
}

export function loadContentTree(rootDir) {
  const out = [];
  for (const kind of ['pages', 'posts']) {
    const dir = join(rootDir, kind);
    let entries = [];
    try {
      entries = readdirSync(dir);
    } catch {
      continue;
    }
    for (const name of entries) {
      if (!name.endsWith('.md')) continue;
      const full = join(dir, name);
      if (!statSync(full).isFile()) continue;
      out.push({
        rel: relative(rootDir, full).replaceAll('\\', '/'),
        ...parseMarkdown(readFileSync(full, 'utf8'), {
          type: kind === 'pages' ? 'page' : 'post',
        }),
      });
    }
  }
  return out;
}
