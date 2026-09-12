'use client';

import Link from 'next/link';
import { Route } from 'next';
import removeMarkdown from 'remove-markdown';
import BookmarkButton from '@/components/bookmark-button';
import { ShareButtons } from './share-buttons';
import { EventResource } from '@/lib/types';
import { createSlugWithId, encodeUrl, truncateText } from '@/lib/utils';
import { discoveryOutlineButtonClass } from '@/lib/discovery-ui';

function googleDateStamp(value: string, time: string): string {
    const datePart = value.slice(0, 10);
    if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
        return `${datePart.replace(/-/g, '')}T${time}`;
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        return '';
    }

    const year = parsed.getFullYear();
    const month = String(parsed.getMonth() + 1).padStart(2, '0');
    const day = String(parsed.getDate()).padStart(2, '0');
    return `${year}${month}${day}T${time}`;
}

function googleCalendarRoute(event: EventResource, eventUrl: string): Route {
    const url = new URL('https://calendar.google.com/calendar/render');
    url.searchParams.set('action', 'TEMPLATE');
    url.searchParams.set('text', event.title);

    const start = googleDateStamp(event.start_date, '100000');
    const end = googleDateStamp(event.end_date || event.start_date, '180000');
    if (start && end) {
        url.searchParams.set('dates', `${start}/${end}`);
    }

    url.searchParams.set('ctz', 'Europe/Moscow');

    const excerpt = truncateText(
        removeMarkdown(event.description ?? '').replace(/\s+/g, ' ').trim(),
        280,
    );
    url.searchParams.set('details', [excerpt, eventUrl].filter(Boolean).join('\n\n'));

    const location = [event.city?.title, event.venue?.address ?? event.venue?.title]
        .filter(Boolean)
        .join(', ');
    if (location) {
        url.searchParams.set('location', location);
    }

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
                href={googleCalendarRoute(event, eventUrl)}
                className="inline-flex h-11 items-center px-2 text-[14px] text-[#4545EF] hover:underline"
            >
                В календарь
            </Link>
        </div>
    );
}
