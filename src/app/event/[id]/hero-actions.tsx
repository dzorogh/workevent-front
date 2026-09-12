'use client';

import Link from 'next/link';
import { Route } from 'next';
import removeMarkdown from 'remove-markdown';
import BookmarkButton from '@/components/bookmark-button';
import { ShareButtons } from './share-buttons';
import { EventResource } from '@/lib/types';
import { createSlugWithId, encodeUrl } from '@/lib/utils';
import { discoveryOutlineButtonClass } from '@/lib/discovery-ui';

function googleCalendarRoute(event: EventResource): Route {
    const url = new URL('https://calendar.google.com/calendar/u/0/r/eventedit');
    url.searchParams.set('text', event.title);
    url.searchParams.set(
        'dates',
        `${event.start_date.replace(/-/g, '')}T100000/${event.end_date.replace(/-/g, '')}T180000`,
    );
    url.searchParams.set('ctz', 'Europe/Moscow');
    url.searchParams.set('details', removeMarkdown(event.description ?? event.title));
    const location = [event.city?.title, event.venue?.address ?? event.venue?.title]
        .filter(Boolean)
        .join(', ');
    url.searchParams.set('location', location);
    url.searchParams.set('pli', '1');
    url.searchParams.set('uid', 'workevent' + event.id.toString());
    url.searchParams.set('sf', 'true');
    url.searchParams.set('output', 'xml');

    return url.toString() as Route;
}

export default function HeroActions({ event }: { event: EventResource }) {
    const eventUrl = `https://workevent.ru/event/${createSlugWithId(event.title, event.id)}`;

    return (
        <div className="flex flex-wrap items-center gap-2">
            <BookmarkButton eventId={event.id} />
            <ShareButtons url={eventUrl} title={event.title} image={event.cover} size={36} />
            {event.website && (
                <Link
                    target="_blank"
                    href={encodeUrl(event.website, { utm_campaign: 'participate' }) as Route}
                    className={discoveryOutlineButtonClass}
                >
                    Сайт организатора
                </Link>
            )}
            <Link
                target="_blank"
                href={googleCalendarRoute(event)}
                className="inline-flex h-11 items-center px-2 text-[14px] text-[#4545EF] hover:underline"
            >
                В календарь
            </Link>
        </div>
    );
}
