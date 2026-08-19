'use client';

import dynamic from 'next/dynamic';
import type { Location } from '@/lib/types';
import type { EventResource } from '@/lib/types';

const LocationMap = dynamic(() => import('./location-map'), {
  loading: () => <div className="h-[500px] bg-muted md:rounded-lg animate-pulse" />,
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
