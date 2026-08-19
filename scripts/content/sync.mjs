export function metadataToApi(metadata = {}) {
  return {
    title: metadata.title ?? null,
    h1: metadata.h1 ?? null,
    description: metadata.description ?? null,
    keywords: metadata.keywords ?? null,
    robots: metadata.robots ?? 'index,follow',
    canonical_url: metadata.canonical_url ?? metadata.canonicalUrl ?? null,
  };
}

export function selectEntries(entries, { only = [] } = {}) {
  if (only.length === 0) return entries;

  return entries.filter((entry) =>
    only.some((raw) => {
      if (raw.startsWith('path:')) return entry.path === raw.slice(5);
      const normalized = raw.endsWith('.md') ? raw : `${raw}.md`;
      return entry.rel === raw || entry.rel === normalized;
    }),
  );
}

function normalizeMeta(metadata) {
  return JSON.stringify(metadataToApi(metadata ?? {}));
}

function pageFingerprint(title, content, metadata) {
  return JSON.stringify({ title, content, metadata: normalizeMeta(metadata) });
}

export function planActions(entries, remote) {
  const pagesByPath = new Map((remote.pages ?? []).map((p) => [p.path, p]));
  const postsById = new Map((remote.posts ?? []).map((p) => [String(p.id), p]));
  const actions = [];

  for (const entry of entries) {
    if (entry.type === 'page') {
      if (!entry.path) {
        actions.push({ method: 'FAIL', entry, error: 'page without path' });
        continue;
      }
      const current = pagesByPath.get(entry.path);
      const nextFp = pageFingerprint(entry.title, entry.body, entry.metadata);
      if (!current) {
        actions.push({
          method: 'POST',
          entry,
          url: '/api/admin/pages',
          body: {
            path: entry.path,
            title: entry.title,
            content: entry.body,
            metadata: metadataToApi(entry.metadata),
          },
          changed: ['path', 'title', 'content', 'metadata'],
        });
        continue;
      }
      const prevFp = pageFingerprint(current.title, current.content, current.metadata);
      if (prevFp === nextFp) {
        actions.push({ method: 'SKIP', entry, id: current.id });
        continue;
      }
      const changed = [];
      if (current.title !== entry.title) changed.push('title');
      if ((current.content ?? '') !== entry.body) changed.push('content');
      if (normalizeMeta(current.metadata) !== normalizeMeta(entry.metadata)) changed.push('metadata.h1');
      actions.push({
        method: 'PUT',
        entry,
        id: current.id,
        url: `/api/admin/pages/${current.id}`,
        body: {
          path: entry.path,
          title: entry.title,
          content: entry.body,
          metadata: metadataToApi(entry.metadata),
        },
        changed: changed.length ? changed : ['content'],
      });
      continue;
    }

    if (entry.id == null) {
      actions.push({
        method: 'POST',
        entry,
        url: '/api/admin/posts',
        body: { title: entry.title, content: entry.body },
        changed: ['title', 'content'],
      });
      continue;
    }

    const current = postsById.get(String(entry.id));
    if (!current) {
      actions.push({ method: 'FAIL', entry, error: `post id=${entry.id} not found` });
      continue;
    }
    if (current.title === entry.title && (current.content ?? '') === entry.body) {
      actions.push({ method: 'SKIP', entry, id: entry.id });
      continue;
    }
    actions.push({
      method: 'PUT',
      entry,
      id: entry.id,
      url: `/api/admin/posts/${entry.id}`,
      body: { title: entry.title, content: entry.body },
      changed: ['title', 'content'],
    });
  }

  return actions;
}
