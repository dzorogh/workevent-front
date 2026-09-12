'use client';

import { useCallback, useEffect, useState } from 'react';
import { readJson, writeJson } from '@/lib/browser-storage';

export const BOOKMARKS_KEY = 'workevent:bookmarks';
const BOOKMARKS_EVENT = 'workevent:bookmarks-changed';

export function readBookmarkIds(): number[] {
  const parsed = readJson<unknown>(BOOKMARKS_KEY, []);
  if (!Array.isArray(parsed)) {
    return [];
  }
  return parsed.filter((id): id is number => typeof id === 'number');
}

function persist(next: number[]): boolean {
  if (!writeJson(BOOKMARKS_KEY, next)) {
    return false;
  }
  window.dispatchEvent(new Event(BOOKMARKS_EVENT));
  return true;
}

export function useBookmarks() {
  const [ids, setIds] = useState<number[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setIds(readBookmarkIds());
    setReady(true);

    const sync = () => setIds(readBookmarkIds());
    window.addEventListener('storage', sync);
    window.addEventListener(BOOKMARKS_EVENT, sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener(BOOKMARKS_EVENT, sync);
    };
  }, []);

  const toggle = useCallback((id: number): boolean => {
    const current = readBookmarkIds();
    const next = current.includes(id)
      ? current.filter((item) => item !== id)
      : [id, ...current];

    if (!persist(next)) {
      return false;
    }

    setIds(next);
    return true;
  }, []);

  const prune = useCallback((removeIds: number[]): boolean => {
    if (removeIds.length === 0) {
      return true;
    }

    const remove = new Set(removeIds);
    const next = readBookmarkIds().filter((id) => !remove.has(id));

    if (!persist(next)) {
      return false;
    }

    setIds(next);
    return true;
  }, []);

  return {
    ids,
    ready,
    isBookmarked: (id: number) => ids.includes(id),
    toggle,
    prune,
  };
}
