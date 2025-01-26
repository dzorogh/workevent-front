import EventCoverImage from '@/components/event-cover-image';
import { IconMapPin } from '@tabler/icons-react';
import Link from 'next/link';
import { EventResource } from '@/lib/types';
import { Route } from 'next';
import { createSlugWithId, formatEventDates } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface EventCardProps {
    event: EventResource;
}

export default function EventCard({ event }: EventCardProps) {
    return (
        <div>
            <Link href={`/event/${createSlugWithId(event.title, event.id)}` as Route} className="block">
                <div className="flex flex-col gap-5">
                    <EventCoverImage cover={event.cover} title={event.title} />

                    <div className="flex flex-col gap-2">
                        <div className="text-muted-foreground-dark">{formatEventDates(event)}</div>
                        <div className="font-semibold text-lg">{event.title}</div>
                        <div className="font-normal text-md text-primary-darker flex gap-1">
                            <IconMapPin className="w-5 h-5 mr-0.5" /> {event.city?.title}
                        </div>
                        <div>
                            <Badge>{event.industry?.title}</Badge>
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    );
} 