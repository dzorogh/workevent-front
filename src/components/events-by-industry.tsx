'use client';

import { useState } from 'react';
import EventCardGrid from '@/components/event-card-grid';
import LoadMoreButton from '@/components/load-more-button';
import { Button } from '@/components/ui/button';
import EventCard from '@/components/event-card';
import { api } from '@/lib/api';
import { IndustryResource, EventResource } from '@/lib/api/types';
import EventCardSkeleton from '@/components/event-card-skeleton';
import H2 from "@/components/ui/h2";
import { components } from '@/lib/api/v1';

interface EventsByIndustryProps {
    initialIndustries: components["schemas"]["IndustryResource"][];
    initialEvents: components["schemas"]["EventResource"][];
    initialMeta: components["schemas"]["SearchEventsResource"]["meta"];
}

export default function EventsByIndustry({ initialIndustries, initialEvents, initialMeta }: EventsByIndustryProps) {
    const [isEventsLoading, setIsEventsLoading] = useState(false);
    const [selectedIndustry, setSelectedIndustry] = useState<number | null>(null);
    const [events, setEvents] = useState<components["schemas"]["EventResource"][]>(initialEvents);
    const [industries, setIndustries] = useState<components["schemas"]["IndustryResource"][]>(initialIndustries);
    const [isLastPage, setIsLastPage] = useState(initialMeta.current_page === initialMeta.last_page);
    const [page, setPage] = useState(1);
    const handleIndustryClick = async (industryId: number | null) => {
        setIsEventsLoading(true);
        setSelectedIndustry(industryId);
        try {
            const response = await api.fetchClient.GET('/v1/events', {
                params: {
                    query: {
                        per_page: 4,
                        industry_id: industryId,
                        page: 1
                    }
                },
                cache: 'force-cache',
                revalidate: false,
            });
            setEvents(response.data?.data ?? []);
            setPage(1);
            setIsLastPage(response.data?.meta.current_page === response.data?.meta.last_page);
        } finally {
            setIsEventsLoading(false);
        }
    };

    const handleLoadMore = async () => {
        const response = await api.fetchClient.GET('/v1/events', {
            params: {
                query: {
                    per_page: 4,
                    industry_id: selectedIndustry,
                    page: page + 1
                }
            }
        });
        setEvents(prev => [...prev, ...response.data?.data ?? []]);
        setPage(prev => prev + 1);
        setIsLastPage(response.data?.meta.current_page === response.data?.meta.last_page);
    };

    return (
        <div className="flex flex-col gap-10">
            <H2>Мероприятия по отраслям</H2>
            <div className="flex flex-col gap-5">
                <div className="flex gap-2 flex-wrap">
                    <Button
                        variant={selectedIndustry === null ? "brand" : "muted"}
                        size="sm"
                        onClick={() => handleIndustryClick(null)}
                    >
                        Все
                    </Button>
                    {industries?.map((industry) => (
                        <Button
                            variant={selectedIndustry === industry.id ? "brand" : "muted"}
                            size="sm"
                            key={industry.id}
                            onClick={() => handleIndustryClick(industry.id)}
                        >
                            {industry.title}
                        </Button>
                    ))}
                </div>
                <EventCardGrid>
                    {isEventsLoading ? (
                        Array(4).fill(0).map((_, index) => (
                            <EventCardSkeleton key={index} />
                        ))
                    ) : (
                        events?.map((event) => (
                            <EventCard key={event.id} event={event} />
                        ))
                    )}
                </EventCardGrid>
                {!isLastPage && <LoadMoreButton onClick={handleLoadMore} />}
            </div>
        </div >
    );
}
