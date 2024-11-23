'use client';

import { useState, useEffect } from "react";
import EventCard from "@/components/event-card";
import EventCardGrid from "@/components/event-card-grid";
import Api from "@/lib/api";
import LoadMoreButton from "@/components/load-more-button";
import { operations, components } from "@/lib/api/v1";
import EventCardSkeleton from "@/components/event-card-skeleton";
type SearchParams = NonNullable<operations["event.index"]["parameters"]["query"]>;

export default function EventsList({
    initialEvents,
    initialMeta,
    params
}: {
    initialEvents: components["schemas"]["EventResource"][],
    initialMeta: components["schemas"]["SearchEventsResource"]["meta"],
    params: SearchParams
}) {
    const [events, setEvents] = useState(initialEvents);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [isLastPage, setIsLastPage] = useState(page === Number(initialMeta.last_page));

    useEffect(() => {
        setEvents(initialEvents);
        setPage(1);
        setIsLastPage(Number(initialMeta.last_page) === 1);
    }, [params, initialEvents, initialMeta]);

    async function loadMore() {
        setLoading(true);
        try {
            const response = await Api.GET('/v1/events', {
                params: {
                    query: {
                        ...(await params),
                        page: page + 1,
                        per_page: 8,
                    }
                }
            });
            const newEvents = response.data?.data ?? [];
            setEvents([...events, ...newEvents]);
            setPage(Number(response.data?.meta.current_page));
            setIsLastPage(Number(response.data?.meta.current_page) === Number(response.data?.meta.last_page));
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex flex-col gap-6">

            <EventCardGrid>
                {events.map((event) => (
                    <EventCard key={event.id} event={event} />
                ))}
                {loading && Array(8).fill(0).map((_, index) => (
                    <EventCardSkeleton key={`loading-${index}`} />
                ))}
            </EventCardGrid>

            {!isLastPage && (
                <div className="flex justify-center">
                    <LoadMoreButton
                        onClick={loadMore}
                    />
                </div>
            )}
        </div>
    );
} 