'use client';

import { useMemo, useState } from "react";
import EventCard from "@/components/event-card";
import EventCardGrid from "@/components/event-card-grid";
import { Api } from "@/lib/api";
import LoadMoreButton from "@/components/load-more-button";
import EventCardSkeleton from "@/components/event-card-skeleton";
import EventsNotFound from "@/components/events-not-found";
import { EventResource, EventIndexParametersQuery, SearchEventsResourceMeta } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IconLayoutGrid, IconList } from "@tabler/icons-react";
import { useToast } from "@/hooks/use-toast";
import H1 from "@/components/ui/h1";
import H2 from "@/components/ui/h2";

type SearchParams = NonNullable<EventIndexParametersQuery>;
type SortKey = 'default' | 'date-asc' | 'date-desc' | 'title';
type Layout = 'grid' | 'list';

function sortEvents(events: EventResource[], sort: SortKey) {
    if (sort === 'default') {
        return events;
    }

    const copy = [...events];
    if (sort === 'title') {
        return copy.sort((a, b) => a.title.localeCompare(b.title, 'ru'));
    }

    return copy.sort((a, b) => {
        const delta = new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
        return sort === 'date-desc' ? -delta : delta;
    });
}

export default function EventsList({
    initialEvents,
    initialMeta,
    params,
    perPage,
    withIndustry = true,
    showViewControls = false,
    showLoadMore = true,
    heading,
    headingAs = 'h2',
    frozen = false,
}: {
    initialEvents: EventResource[],
    initialMeta: SearchEventsResourceMeta,
    params: SearchParams,
    perPage: number,
    withIndustry?: boolean
    showViewControls?: boolean
    showLoadMore?: boolean
    heading?: string
    headingAs?: 'h1' | 'h2'
    frozen?: boolean
}) {
    const { toast } = useToast();
    const [events, setEvents] = useState<EventResource[]>(initialEvents);
    const [previousParams, setPreviousParams] = useState<SearchParams>(params);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [loading, setLoading] = useState<boolean>(false);
    const [isLastPage, setIsLastPage] = useState<boolean>(currentPage === Number(initialMeta.last_page));
    const [total, setTotal] = useState<number>(Number(initialMeta.total));
    const [layout, setLayout] = useState<Layout>('grid');
    const [sort, setSort] = useState<SortKey>('default');

    if (!frozen && JSON.stringify(params) !== JSON.stringify(previousParams)) {
        setPreviousParams(params);
        setIsLastPage(false);
        setCurrentPage(1);
        setEvents([]);
        setTotal(0);

        loadEvents();
    }

    async function loadEvents(loadMore: boolean = false) {
        setLoading(true);
        try {
            const response = await Api.GET('/v1/events', {
                params: {
                    query: {
                        ...params,
                        page: loadMore ? currentPage + 1 : 1,
                        per_page: perPage,
                    }
                }
            });
            const newEvents = response.data?.data ?? [];

            setEvents(loadMore ? [...events, ...newEvents] : newEvents);
            setCurrentPage(Number(response.data?.meta.current_page));
            setTotal(Number(response.data?.meta.total));
            setIsLastPage(Number(response.data?.meta.current_page) === Number(response.data?.meta.last_page));
        } catch {
            toast({
                title: 'Не удалось загрузить',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    }

    const visibleEvents = useMemo(() => sortEvents(events, sort), [events, sort]);

    const headingClassName = "mt-0 min-w-0 text-[28px] min-[1200px]:text-[34px] min-[1200px]:leading-10 font-bold tracking-tight text-[#090D2B]";
    const headingNode = heading
        ? headingAs === 'h1'
            ? <H1 className={headingClassName}>{heading}</H1>
            : <H2 className={headingClassName}>{heading}</H2>
        : <div />;

    const toolbar = showViewControls ? (
        <div className="flex flex-col gap-3 min-[768px]:flex-row min-[768px]:items-center min-[768px]:justify-between">
            {headingNode}
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
                        <SelectItem value="default">Сортировать</SelectItem>
                        <SelectItem value="date-asc">Дата ближе</SelectItem>
                        <SelectItem value="date-desc">Дата позже</SelectItem>
                        <SelectItem value="title">По названию</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    ) : heading ? (
        <H2 className="mt-0">{heading}</H2>
    ) : null;

    return (
        <div className="flex flex-col gap-[17px]">
            {toolbar}

            {!loading && events.length === 0 ? (
                <EventsNotFound />
            ) : (
                <>
                    <EventCardGrid layout={layout}>
                        {visibleEvents.map((event) => (
                            <EventCard key={event.id} event={event} withIndustry={withIndustry} layout={layout} />
                        ))}
                        {loading && Array(perPage).fill(0).map((_, index) => (
                            <EventCardSkeleton key={`loading-${index}`} withIndustry={withIndustry} layout={layout} />
                        ))}
                    </EventCardGrid>

                    {showLoadMore && !isLastPage && !loading && (
                        <div className="flex justify-center">
                            <LoadMoreButton
                                loadedCount={events.length}
                                total={total}
                                perPage={perPage}
                                onClick={() => {
                                    loadEvents(true);
                                }}
                            />
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
