'use client';

import { useCallback, useEffect, useState } from 'react';
import { readJson, writeJson } from '@/lib/browser-storage';

export const BOOKMARKS_KEY = 'workevent:bookmarks';
const BOOKMARKS_EVENT = 'workevent:bookmarks-changed';

function readBookmarkIds(): number[] {
  const parsed = readJson<unknown>(BOOKMARKS_KEY, []);
  if (!Array.isArray(parsed)) {
    return [];
  }
  return parsed.filter((id): id is number => typeof id === 'number');
}

export function useBookmarks() {
  const [ids, setIds] = useState<number[]>([]);

  useEffect(() => {
    setIds(readBookmarkIds());

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
      : [...current, id];

    if (!writeJson(BOOKMARKS_KEY, next)) {
      return false;
    }

    setIds(next);
    window.dispatchEvent(new Event(BOOKMARKS_EVENT));
    return true;
  }, []);

  return {
    ids,
    isBookmarked: (id: number) => ids.includes(id),
    toggle,
  };
}
