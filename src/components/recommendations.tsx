'use client';

import { useState } from 'react';
import H2 from '@/components/ui/h2';
import EventCardGrid from '@/components/event-card-grid';
import LoadMoreButton from '@/components/load-more-button';
import EventCard from '@/components/event-card';
import { EventResource } from '@/lib/api/types';
import EventCardSkeleton from '@/components/event-card-skeleton';
import { api } from '@/lib/api';
import { components } from '@/lib/api/v1';

interface RecommendationsProps {
    initialEvents: components["schemas"]["EventResource"][];
    initialMeta: components["schemas"]["SearchEventsResource"]["meta"];
}

export default function Recommendations({ initialEvents, initialMeta }: RecommendationsProps) {
    const [events, setEvents] = useState<EventResource[]>(initialEvents);
    const [isLoading, setIsLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [isLastPage, setIsLastPage] = useState(initialMeta.current_page === initialMeta.last_page);

    const handleLoadMore = async () => {
        setIsLoading(true);
        try {
            const response = await api.fetchClient.GET('/v1/events', {
                cache: 'force-cache',
                revalidate: false,
                params: {
                    query: {
                        per_page: 4,
                        page: page + 1,
                        is_priority: 1
                    }
                }
            });
            setEvents(prev => [...prev, ...response.data?.data ?? []]);
            setPage(prev => prev + 1);
            setIsLastPage(response.data?.meta.current_page === response.data?.meta.last_page);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-10">
            <H2>Рекомендуемые мероприятия</H2>
            <div className="flex flex-col gap-10">
                <EventCardGrid>
                    {events?.map((event) => (
                        <EventCard key={event.id} event={event} />
                    ))}
                    {isLoading && Array(4).fill(0).map((_, index) => (
                        <EventCardSkeleton key={`loading-${index}`} />
                    ))}
                </EventCardGrid>
                {!isLastPage && <LoadMoreButton onClick={handleLoadMore} />}
            </div>
        </div>
    );
} 