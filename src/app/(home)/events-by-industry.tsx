'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import H2 from "@/components/ui/h2";
import {EventResource, IndustryResource, SearchEventsResourceMeta} from "@/lib/types";
import EventsList from '@/components/events-list';

interface EventsByIndustryProps {
    initialIndustries: IndustryResource[];
    initialEvents: EventResource[];
    initialMeta: SearchEventsResourceMeta;
}

export default function EventsByIndustry({ initialIndustries, initialEvents, initialMeta }: EventsByIndustryProps) {
    const [selectedIndustry, setSelectedIndustry] = useState<number | null>(null);
    const [events, setEvents] = useState<EventResource[]>(initialEvents);
    const [industries] = useState<IndustryResource[]>(initialIndustries);

    return (
        <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-5">
                <div className="flex gap-2 flex-wrap">
                    <Button
                        variant={selectedIndustry === null ? "primary" : "muted"}
                        size="sm"
                        onClick={() => setSelectedIndustry(null)}
                    >
                        Все
                    </Button>
                    {industries?.map((industry) => (
                        <Button
                            variant={selectedIndustry === industry.id ? "primary" : "muted"}
                            size="sm"
                            key={industry.id}
                            onClick={() => setSelectedIndustry(industry.id)}
                        >
                            {industry.title}
                        </Button>
                    ))}
                </div>

                <EventsList initialEvents={events} initialMeta={initialMeta} params={{industry_id: selectedIndustry}} perPage={4} />
            </div>
        </div >
    );
}
