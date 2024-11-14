'use client';

import { useEffect, useRef, useState } from 'react';

export function useIntersection(options?: IntersectionObserverInit) {
  const [isIntersecting, setIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current || hasIntersected) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIntersecting(true);
        setHasIntersected(true);
        observer.disconnect();
      }
    }, {
      threshold: 0,
      rootMargin: '100px',
      ...options
    });

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [options, hasIntersected]);

  return { ref, isIntersecting };
} 