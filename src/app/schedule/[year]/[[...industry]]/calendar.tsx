'use client';

import { EventResource } from "@/lib/types";
import CalendarMonth from "./calendar-month";

const MONTH_NAMES = [
    'Январь',
    'Февраль',
    'Март',
    'Апрель',
    'Май',
    'Июнь',
    'Июль',
    'Август',
    'Сентябрь',
    'Октябрь',
    'Ноябрь',
    'Декабрь',
];

export default function Calendar({ events, fromMonth = 0 }: { events: EventResource[]; fromMonth?: number }) {
    const months = MONTH_NAMES
        .map((name, index) => ({ name, events: [] as EventResource[], index }))
        .filter((month) => month.index >= fromMonth);

    events.forEach((event) => {
        const eventMonth = new Date(event.start_date).getMonth();
        const month = months.find((item) => item.index === eventMonth);
        if (month) {
            month.events.push(event);
        }
    });

    return (
        <div className="grid grid-cols-1 gap-3 min-[768px]:grid-cols-2 min-[1200px]:grid-cols-3">
            {months.map((month) => (
                <CalendarMonth key={month.name} month={month} />
            ))}
        </div>
    );
}
