'use client';

import { EventResource } from "@/lib/api/types";
import AppLink from "@/components/ui/app-link";
import { createSlugWithId, plural } from "@/lib/utils";
import { Route } from "next";

export default function Calendar({ events }: { events: EventResource[] }) {

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

    events.forEach((event) => {
        const month = months.find((month) => new Date(event.start_date).getMonth() === months.indexOf(month));
        if (month) {
            month.events.push(event);
        }
    });

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4 relative">
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
                                        <AppLink key={event.id} href={`/event/${createSlugWithId(event.title, event.id)}` as Route} className=" flex gap-4 items-start justify-start text-sm font-bold">
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