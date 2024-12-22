'use client';

import Api from "@/lib/api";
import { EventResource, IndustryResource } from "@/lib/api/types";
import { Button } from "@/components/ui/button";
import { useState} from "react";
import AppLink from "@/components/ui/app-link";
import { createEventSlug, plural } from "@/lib/utils";
import { Route } from "next";
import { EventIndexParametersQuery } from "@/lib/api/types";
import { Loader2 } from "lucide-react";

type SearchParams = NonNullable<EventIndexParametersQuery>;

export default function Calendar({ industries, initialEvents, params }: { industries: IndustryResource[], initialEvents: EventResource[], params: SearchParams }) {
    const [loading, setLoading] = useState<boolean>(false);
    const [events, setEvents] = useState<EventResource[]>(initialEvents);
    const [selectedIndustry, setSelectedIndustry] = useState<number | null>(null);
    const [prevSelectedIndustry, setPrevSelectedIndustry] = useState<number | null>(null);

    const months: { name: string; events: EventResource[] }[] = [
        { name: 'Январь', events: [] },
        { name: 'Февраль', events: [] },
        { name: 'Март', events: [] },
        { name: 'Апрель', events: [] },
        { name: 'Май', events: [] },
        { name: 'Июнь', events: [] },
        { name: 'Июль', events: [] },
        { name: 'Август', events: [] },
        { name: 'Сентябрь', events: [] },
        { name: 'Октябрь', events: [] },
        { name: 'Ноябрь', events: [] },
        { name: 'Декабрь', events: [] },
    ];

    async function loadEvents() {
        setLoading(true);
        try {
            const response = await Api.GET('/v1/events', {
                params: {
                    query: {
                        ...params,
                        industry_id: selectedIndustry,
                    }
                }
            });
            const newEvents = response.data?.data ?? [];

            setEvents(newEvents);
        } finally {
            setLoading(false);
        }
    }

    if (selectedIndustry !== prevSelectedIndustry) {
        setPrevSelectedIndustry(selectedIndustry);

        setEvents([]);
        loadEvents();
    }

    events.forEach((event) => {
        const month = months.find((month) => new Date(event.start_date).getMonth() === months.indexOf(month));
        if (month) {
            month.events.push(event);
        }
    });

    return (
        <div className="flex flex-col gap-6">
            <div className="flex gap-2 flex-wrap">
                <Button
                    variant={selectedIndustry === null ? "brand" : "muted"}
                    size="sm"
                    onClick={() => setSelectedIndustry(null)}
                >
                    Все
                </Button>
                {industries.map((industry) => (
                    <Button
                        variant={selectedIndustry === industry.id ? "brand" : "muted"}
                        size="sm"
                        key={industry.id}
                        onClick={() => setSelectedIndustry(industry.id)}
                    >
                        {industry.title}
                    </Button>
                ))}
            </div>
            <div className="flex flex-col gap-4 relative">
                {loading && <div className="flex justify-center  absolute top-0 left-0 right-0 bottom-0 bg-background/90 h-full">
                    <Loader2 className="w-12 h-12 animate-spin mt-[30vh]" />
                </div>}
                <div className="grid grid-cols-1 auto-rows-fr md:grid-cols-3 gap-4">
                    {months.map((month) => (
                        <div key={month.name} className="flex flex-col bg-muted p-4 rounded-lg">
                            <div className="flex flex-col gap-2">
                                <div className="flex justify-between items-center">
                                    <div className="text-lg font-bold">{month.name}</div>
                                    <div className="text-sm text-muted-foreground">
                                        {month.events.length} {plural(['мероприятие', 'мероприятия', 'мероприятий'], month.events.length)}
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    {month.events.sort((a, b) => new Date(a.start_date).getDate() - new Date(b.start_date).getDate()).map((event) => (
                                        <AppLink key={event.id} href={`/event/${createEventSlug(event.title, event.id)}` as Route} className=" flex gap-4 items-start justify-start text-sm font-bold">
                                            <div className="w-6 flex items-center justify-end shrink-0 text-muted-foreground">
                                                {new Date(event.start_date).getDate()}
                                            </div>
                                            <div className="">
                                                {event.title}
                                            </div>
                                        </AppLink>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}