'use client';

import EventCoverImage from '@/components/event-cover-image';
import { IconBookmark, IconBookmarkFilled, IconMapPin } from '@tabler/icons-react';
import Link from 'next/link';
import { EventResource } from '@/lib/types';
import { Route } from 'next';
import { createSlugWithId, formatEventDateBadge, formatEventDatesShort, splitEventTitle } from '@/lib/utils';
import { useBookmarks } from '@/hooks/use-bookmarks';
import { useToast } from '@/hooks/use-toast';

interface EventCardProps {
    event: EventResource;
    withIndustry?: boolean;
    layout?: 'grid' | 'list';
}

function BookmarkButton({ eventId }: { eventId: number }) {
    const { isBookmarked, toggle } = useBookmarks();
    const { toast } = useToast();
    const bookmarked = isBookmarked(eventId);

    return (
        <button
            type="button"
            className="inline-flex size-8 items-center justify-center text-[#657087] hover:text-[#4545EF] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4545EF]"
            aria-label={bookmarked ? 'Убрать из закладок' : 'Добавить в закладки'}
            aria-pressed={bookmarked}
            onClick={() => {
                if (!toggle(eventId)) {
                    toast({
                        title: 'Не удалось сохранить на этом устройстве',
                        variant: 'destructive',
                    });
                }
            }}
        >
            {bookmarked ? <IconBookmarkFilled className="size-5 text-[#4545EF]" /> : <IconBookmark className="size-5" stroke={1.75} />}
        </button>
    );
}

export default function EventCard({ event, withIndustry = true, layout = 'grid' }: EventCardProps) {
    const href = `/event/${createSlugWithId(event.title, event.id)}` as Route;
    const industryTitle = event.industry?.title;
    const badge = formatEventDateBadge(event);
    const { heading, subtitle } = splitEventTitle(event.title);

    if (layout === 'list') {
        return (
            <div className="flex items-center gap-4 rounded-2xl bg-white p-3">
                <Link href={href} className="flex min-w-0 grow items-center gap-4">
                    <div className="relative w-32 shrink-0 overflow-hidden rounded-2xl">
                        <EventCoverImage cover={event.cover} title={event.title} className="rounded-2xl border-0" />
                    </div>
                    <div className="min-w-0 flex flex-col gap-1">
                        <div className="text-sm text-[#657087]">{formatEventDatesShort(event)}</div>
                        <div className="font-semibold truncate">{event.title}</div>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-[#657087]">
                            {event.city?.title && (
                                <span className="inline-flex items-center gap-1">
                                    <IconMapPin className="size-4" stroke={1.75} />
                                    {event.city.title}
                                </span>
                            )}
                            {withIndustry && industryTitle && (
                                <span className="text-[#4545EF]">{industryTitle}</span>
                            )}
                        </div>
                    </div>
                </Link>
                <BookmarkButton eventId={event.id} />
            </div>
        );
    }

    return (
        <div className="flex min-h-[365px] flex-col overflow-hidden rounded-[16px] bg-white">
            <Link href={href} className="flex min-h-0 grow flex-col">
                <div className="relative h-[222px] overflow-hidden">
                    <EventCoverImage
                        cover={event.cover}
                        title={event.title}
                        className="h-full rounded-none border-0 aspect-auto"
                    />
                    <div className="absolute left-[13px] top-[13px] flex h-16 min-w-[72px] flex-col justify-center rounded-[12px] bg-white px-3.5 shadow-[0_8px_20px_rgba(15,23,42,0.08)]">
                        <div className="text-[20px] font-semibold leading-none tracking-tight text-[#090D2B]">{badge.day}</div>
                        <div className="mt-1.5 text-[12px] leading-none text-[#657087]">{badge.month}</div>
                    </div>
                </div>
                <div className="flex flex-col px-5 pt-5">
                    {event.city?.title && (
                        <div className="flex items-center gap-1 text-[14px] leading-5 text-[#657087]">
                            <IconMapPin className="size-4" stroke={1.75} />
                            {event.city.title}
                        </div>
                    )}
                    <div className="mt-1.5 text-[20px] font-bold leading-[26px] text-[#090D2B] line-clamp-2">{heading}</div>
                    {subtitle && (
                        <div className="mt-1 text-[16px] leading-[22px] text-[#657087] line-clamp-1">{subtitle}</div>
                    )}
                </div>
            </Link>
            <div className="mt-auto flex items-center justify-between px-5 pb-4 pt-3">
                {withIndustry && industryTitle ? (
                    <span className="text-[14px] text-[#4545EF]">{industryTitle}</span>
                ) : <span />}
                <BookmarkButton eventId={event.id} />
            </div>
        </div>
    );
}
