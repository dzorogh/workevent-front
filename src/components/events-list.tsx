'use client';

import { useState, useEffect } from "react";
import EventCard from "@/components/event-card";
import EventCardGrid from "@/components/event-card-grid";
import Api from "@/lib/api";
import LoadMoreButton from "@/components/load-more-button";
import EventCardSkeleton from "@/components/event-card-skeleton";
import EventsNotFound from "@/components/events-not-found";
import { EventResource, EventIndexParametersQuery, SearchEventsResourceMeta } from "@/lib/api/types";

type SearchParams = NonNullable<EventIndexParametersQuery>;

export default function EventsList({
    initialEvents,
    initialMeta,
    params,
    perPage
}: {
    initialEvents: EventResource[],
    initialMeta: SearchEventsResourceMeta,
    params: SearchParams,
    perPage: number
}) {
    const [events, setEvents] = useState<EventResource[]>(initialEvents);
    const [previousParams, setPreviousParams] = useState<SearchParams>(params);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [loading, setLoading] = useState<boolean>(false);
    const [isLastPage, setIsLastPage] = useState<boolean>(currentPage === Number(initialMeta.last_page));
    const [total, setTotal] = useState<number>(Number(initialMeta.total));

    if (JSON.stringify(params) !== JSON.stringify(previousParams)) {
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
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex flex-col gap-6">
            {!loading && events.length === 0 ? (
                <EventsNotFound />
            ) : (
                <>
                    <EventCardGrid>
                        {events.map((event) => (
                            <EventCard key={event.id} event={event} />
                        ))}
                        {loading && Array(perPage).fill(0).map((_, index) => (
                            <EventCardSkeleton key={`loading-${index}`} />
                        ))}
                    </EventCardGrid>

                    {!isLastPage && !loading && (
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
