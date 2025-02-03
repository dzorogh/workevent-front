'use client';

import { EventResource } from "@/lib/types";
import CalendarMonth from "./calendar-month";

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
                <div className="flex flex-col md:grid md:grid-cols-3 gap-4">
                    {months.map((month) => (
                        <CalendarMonth key={month.name} month={month} />
                    ))}
                </div>
            </div>
        </div>
    );
}