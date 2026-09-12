'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Route } from 'next';
import EventCard from '@/components/event-card';
import EventCardGrid from '@/components/event-card-grid';
import EventCardSkeleton from '@/components/event-card-skeleton';
import H1 from '@/components/ui/h1';
import H2 from '@/components/ui/h2';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { IconLayoutGrid, IconList } from '@tabler/icons-react';
import { useBookmarks } from '@/hooks/use-bookmarks';
import { useToast } from '@/hooks/use-toast';
import { fetchEventsByIds, isEventPast } from '@/lib/bookmarks';
import { EventResource } from '@/lib/types';
import { plural } from '@/lib/utils';

type SortKey = 'added' | 'date-asc' | 'date-desc' | 'title';
type Layout = 'grid' | 'list';

function sortEvents(events: EventResource[], ids: number[], sort: SortKey) {
    const copy = [...events];
    if (sort === 'title') {
        return copy.sort((a, b) => a.title.localeCompare(b.title, 'ru'));
    }
    if (sort === 'date-asc' || sort === 'date-desc') {
        return copy.sort((a, b) => {
            const delta = new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
            return sort === 'date-desc' ? -delta : delta;
        });
    }
    const order = new Map(ids.map((id, index) => [id, index]));
    return copy.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
}

export default function BookmarksPage() {
    const { ids, ready, prune } = useBookmarks();
    const { toast } = useToast();
    const [events, setEvents] = useState<EventResource[]>([]);
    const [loading, setLoading] = useState(true);
    const [failed, setFailed] = useState(false);
    const [layout, setLayout] = useState<Layout>('grid');
    const [sort, setSort] = useState<SortKey>('added');
    const [reloadToken, setReloadToken] = useState(0);
    const loadedRef = useRef<Set<number>>(new Set());

    useEffect(() => {
        if (!ready) {
            return;
        }

        const unknown = ids.filter((id) => !loadedRef.current.has(id));
        if (unknown.length === 0) {
            setLoading(false);
            setFailed(false);
            return;
        }

        let cancelled = false;
        setLoading(true);
        setFailed(false);

        fetchEventsByIds(unknown)
            .then(({ events: loaded, missing }) => {
                if (cancelled) {
                    return;
                }
                unknown.forEach((id) => loadedRef.current.add(id));
                setEvents((prev) => {
                    const map = new Map(prev.map((event) => [event.id, event]));
                    for (const event of loaded) {
                        map.set(event.id, event);
                    }
                    return ids
                        .map((id) => map.get(id))
                        .filter((event): event is EventResource => Boolean(event));
                });
                if (missing.length > 0) {
                    prune(missing);
                }
                setLoading(false);
            })
            .catch(() => {
                if (cancelled) {
                    return;
                }
                setFailed(true);
                setLoading(false);
                toast({
                    title: 'Не удалось загрузить закладки',
                    variant: 'destructive',
                });
            });

        return () => {
            cancelled = true;
        };
    }, [ids, ready, prune, toast, reloadToken]);

    const visible = useMemo(
        () => sortEvents(events.filter((event) => ids.includes(event.id)), ids, sort),
        [events, ids, sort],
    );
    const upcoming = visible.filter((event) => !isEventPast(event));
    const past = visible.filter((event) => isEventPast(event));
    const showSkeletons = ready && loading && visible.length === 0 && ids.length > 0;
    const empty = ready && ids.length === 0;

    const headingClassName = 'mt-0 min-w-0 text-[28px] min-[1200px]:text-[34px] min-[1200px]:leading-10 font-bold tracking-tight text-[#090D2B]';

    return (
        <div className="flex flex-col gap-[17px]">
            <div className="flex flex-col gap-3 min-[768px]:flex-row min-[768px]:items-center min-[768px]:justify-between">
                <div className="min-w-0">
                    <H1 className={headingClassName}>Закладки</H1>
                    {ready && ids.length > 0 && (
                        <p className="mt-1 text-[14px] text-[#657087]">
                            {ids.length} {plural(['мероприятие', 'мероприятия', 'мероприятий'], ids.length)} на этом устройстве
                        </p>
                    )}
                </div>
                {ready && ids.length > 0 && (
                    <div className="flex items-center gap-3 shrink-0 text-[#657087]">
                        <div className="flex items-center gap-1">
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className={layout === 'grid' ? 'text-foreground' : 'text-muted-foreground'}
                                aria-label="Сетка"
                                aria-pressed={layout === 'grid'}
                                onClick={() => setLayout('grid')}
                            >
                                <IconLayoutGrid className="size-5" />
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className={layout === 'list' ? 'text-foreground' : 'text-muted-foreground'}
                                aria-label="Список"
                                aria-pressed={layout === 'list'}
                                onClick={() => setLayout('list')}
                            >
                                <IconList className="size-5" />
                            </Button>
                        </div>
                        <Select value={sort} onValueChange={(value) => setSort(value as SortKey)}>
                            <SelectTrigger className="w-40 border-0 bg-transparent shadow-none ring-0 px-0 text-sm text-muted-foreground-dark">
                                <SelectValue placeholder="Сортировать" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="added">Сначала новые</SelectItem>
                                <SelectItem value="date-asc">Дата ближе</SelectItem>
                                <SelectItem value="date-desc">Дата позже</SelectItem>
                                <SelectItem value="title">По названию</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                )}
            </div>

            {empty && (
                <div className="flex flex-col items-center gap-4 rounded-[16px] bg-white px-6 py-16 text-center">
                    <p className="text-lg font-semibold text-[#090D2B]">Пока нет закладок</p>
                    <p className="max-w-md text-[#657087]">
                        Сохраняйте мероприятия иконкой на карточке — они останутся на этом устройстве.
                    </p>
                    <Link
                        href={'/events' as Route}
                        className="inline-flex h-[38px] items-center justify-center rounded-lg bg-[#4545EF] px-4 text-[14px] text-white hover:bg-[#3838d4] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4545EF]"
                    >
                        Смотреть мероприятия
                    </Link>
                </div>
            )}

            {failed && visible.length === 0 && !empty && (
                <div className="flex flex-col items-center gap-4 rounded-[16px] bg-white px-6 py-16 text-center">
                    <p className="text-lg font-semibold text-[#090D2B]">Не удалось загрузить закладки</p>
                    <Button
                        type="button"
                        variant="primary"
                        onClick={() => {
                            loadedRef.current = new Set();
                            setEvents([]);
                            setFailed(false);
                            setReloadToken((token) => token + 1);
                        }}
                    >
                        Повторить
                    </Button>
                </div>
            )}

            {showSkeletons && (
                <EventCardGrid layout={layout}>
                    {Array.from({ length: Math.min(Math.max(ids.length, 3), 6) }).map((_, index) => (
                        <EventCardSkeleton key={`bookmark-skeleton-${index}`} layout={layout} />
                    ))}
                </EventCardGrid>
            )}

            {!empty && !showSkeletons && upcoming.length > 0 && (
                <EventCardGrid layout={layout}>
                    {upcoming.map((event) => (
                        <EventCard key={event.id} event={event} layout={layout} />
                    ))}
                </EventCardGrid>
            )}

            {!empty && !showSkeletons && past.length > 0 && (
                <div className="flex flex-col gap-[17px] pt-4">
                    <H2 className="mt-0 text-[20px] font-semibold text-[#090D2B]">Прошедшие</H2>
                    <EventCardGrid layout={layout}>
                        {past.map((event) => (
                            <EventCard key={event.id} event={event} layout={layout} />
                        ))}
                    </EventCardGrid>
                </div>
            )}
        </div>
    );
}
