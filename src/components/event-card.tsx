import EventCoverImage from '@/components/event-cover-image';
import { IconMapPin } from '@tabler/icons-react';
import Link from 'next/link';
import { EventResource } from '@/lib/types';
import { Route } from 'next';
import { createSlugWithId, formatEventDates } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface EventCardProps {
    event: EventResource;
    withIndustry?: boolean;
}

export default function EventCard({ event, withIndustry = true }: EventCardProps) {
    return (
        <div>
            <Link href={`/event/${createSlugWithId(event.title, event.id)}` as Route} className="block h-full">
                <div className="flex flex-col gap-5 border rounded-lg p-4 h-full">
                    <EventCoverImage cover={event.cover} title={event.title} />

                    <div className="flex flex-col gap-2 grow">
                        <div className="flex justify-between">
                            <div className="text-muted-foreground-dark text-sm">{formatEventDates(event)}</div>
                            <div className="font-normal text-sm text-primary-darker flex gap-1">
                                <IconMapPin className="w-5 h-5 mr-0.5" /> {event.city?.title}
                            </div>
                        </div>
                        <div className="font-medium text-md grow">{event.title}</div>
                        {withIndustry && <div>
                                <Badge variant="secondary">{event.industry?.title}</Badge>
                            </div>
                        }
                    </div>
                </div>
            </Link>
        </div>
    );
} 