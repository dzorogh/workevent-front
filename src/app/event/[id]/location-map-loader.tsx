'use client';

import dynamic from 'next/dynamic';
import type { Location } from '@/lib/types';
import type { EventResource } from '@/lib/types';

const LocationMap = dynamic(() => import('./location-map'), {
  ssr: false,
  loading: () => <div className="h-[420px] animate-pulse rounded-[16px] bg-muted" />,
});

export default function LocationMapLoader({
  location,
  event,
}: {
  location: Location;
  event: EventResource;
}) {
  return <LocationMap location={location} event={event} />;
}
