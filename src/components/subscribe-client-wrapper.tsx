'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from "@/components/ui/skeleton";
import { useIntersection } from '@/components/use-intersection';

const SubscribeWithoutSSR = dynamic(
  () => import('@/components/subscribe'),
  { 
    ssr: false,
    loading: () => (
      <Skeleton className="h-64 w-full" />
    ),
  }
);

export default function SubscribeClientWrapper() {
  const { ref, isIntersecting } = useIntersection();

  return (
    <div ref={ref}>
      {isIntersecting && <SubscribeWithoutSSR />}
    </div>
  );
} 