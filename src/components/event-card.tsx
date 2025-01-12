import EventCoverImage from '@/components/event-cover-image';
import { IconMapPin } from '@tabler/icons-react';
import Link from 'next/link';
import { EventResource } from '@/lib/api/types';
import { Route } from 'next';
import { createSlugWithId } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface EventCardProps {
    event: EventResource;
}

const formatDates = (event: EventResource) => {
    // return "19-22 октября 2025" if dateStart and dateEnd are in the same month and year
    // return "19 окт - 22 нояб 2025" if dateStart and dateEnd are in different months

    const dateStart = new Date(event.start_date);
    const dateEnd = event.end_date ? new Date(event.end_date) : dateStart;

    const months = [
        'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
        'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
    ];

    const shortMonths = [
        'янв', 'фев', 'мар', 'апр', 'мая', 'июня',
        'июл', 'авг', 'сен', 'окт', 'нояб', 'дек'
    ];

    if (dateStart.getMonth() === dateEnd.getMonth() &&
        dateStart.getFullYear() === dateEnd.getFullYear()) {
        return `${dateStart.getDate()}–${dateEnd.getDate()} ${months[dateStart.getMonth()]} ${dateStart.getFullYear()}`;
    }

    return `${dateStart.getDate()} ${shortMonths[dateStart.getMonth()]} – ${dateEnd.getDate()} ${shortMonths[dateEnd.getMonth()]} ${dateStart.getFullYear()}`;
}

export default function EventCard({ event }: EventCardProps) {
    return (
        <div>
            <Link href={`/event/${createSlugWithId(event.title, event.id)}` as Route} className="block">
                <div className="flex flex-col gap-5">
                    <EventCoverImage cover={event.cover} title={event.title} />
                    <div className="flex flex-col gap-2">
                        <div className="text-muted-foreground-dark">{formatDates(event)}</div>
                        <div className="font-semibold text-lg">{event.title}</div>
                        <div className="font-normal text-md text-brand-darker flex gap-1">
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