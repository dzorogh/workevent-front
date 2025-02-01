'use client';

import { EventResource } from "@/lib/types";
import AppLink from "@/components/ui/app-link";
import { createSlugWithId, plural } from "@/lib/utils";
import { Route } from "next";
import Link from "next/link";

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
                <div className="flex flex-col md:grid auto-rows-fr md:grid-cols-3 gap-4">
                    {months.map((month) => (
                        <div key={month.name} className="flex flex-col border border-border p-8 rounded-lg">
                            <div className="flex flex-col gap-4">
                                <div className="flex justify-between items-center">
                                    <div className="text-xl font-semibold">{month.name}</div>
                                    <div className="text-sm text-muted-foreground font-normal">
                                        {month.events.length} {plural(['мероприятие', 'мероприятия', 'мероприятий'], month.events.length)}
                                    </div>
                                </div>
                                <div className="flex flex-col ">
                                    {month.events.sort((a, b) => new Date(a.start_date).getDate() - new Date(b.start_date).getDate()).map((event) => (
                                        <Link key={event.id} href={`/event/${createSlugWithId(event.title, event.id)}` as Route} className="border-b last:border-b-0 border-border py-2 flex gap-4 justify-start items-baseline">
                                            <div className="w-4 flex shrink-0 text-muted-foreground-dark text-sm">
                                                {new Date(event.start_date).getDate()}
                                            </div>
                                            <div className="">
                                                {event.title}
                                            </div>
                                        </Link>
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