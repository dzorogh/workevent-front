'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from "@/components/ui/skeleton";
import { useIntersection } from '@/components/use-intersection';

const SearchWithoutSSR = dynamic(
  () => import('@/components/search').then(mod => mod.default),
  { 
    ssr: false,
    loading: () => (
      <Skeleton className="rounded-lg h-[119px]">
        {/* <div className="flex gap-4">
          <div className="flex-[1.5]">
            <Skeleton className="h-6 w-24 mb-2" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="flex-1">
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="flex-1">
            <Skeleton className="h-6 w-20 mb-2" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="flex-1">
            <Skeleton className="h-6 w-16 mb-2" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="flex-[0.5] flex items-end">
            <Skeleton className="h-10 w-full" />
          </div>
        </div> */}
      </Skeleton>
    ),
  }
);

export default function SearchClientWrapper() {
  return (
    <SearchWithoutSSR />
  );
} 