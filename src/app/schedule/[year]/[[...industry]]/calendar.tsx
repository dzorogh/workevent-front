'use client';

import { EventResource } from "@/lib/types";
import { IconChevronDown } from "@tabler/icons-react";
import { useState } from "react";
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

function MonthGrid({ months }: { months: { name: string; events: EventResource[] }[] }) {
    return (
        <div className="grid grid-cols-1 gap-3 min-[768px]:grid-cols-2 min-[1200px]:grid-cols-3">
            {months.map((month) => (
                <CalendarMonth key={month.name} month={month} />
            ))}
        </div>
    );
}

function PastMonths({ months }: { months: { name: string; events: EventResource[] }[] }) {
    const [open, setOpen] = useState(false);
    const first = months[0]?.name.toLowerCase();
    const last = months[months.length - 1]?.name.toLowerCase();
    const range = first === last ? first : `${first}–${last}`;

    return (
        <div className="flex flex-col gap-3">
            <button
                type="button"
                onClick={() => setOpen((value) => !value)}
                aria-expanded={open}
                className="flex w-full items-center justify-between gap-3 rounded-[16px] bg-white/70 px-5 py-3 text-left text-[13px] text-[#9AA3B5] transition-colors hover:bg-white hover:text-[#657087]"
            >
                <span>Прошедшие месяцы · {range}</span>
                <IconChevronDown className={`size-4 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>
            {open && <MonthGrid months={months} />}
        </div>
    );
}

export default function Calendar({ events, fromMonth = 0 }: { events: EventResource[]; fromMonth?: number }) {
    const months = MONTH_NAMES.map((name) => ({ name, events: [] as EventResource[] }));

    events.forEach((event) => {
        const month = months[new Date(event.start_date).getMonth()];
        if (month) {
            month.events.push(event);
        }
    });

    const pastMonths = months.slice(0, fromMonth);
    const currentMonths = months.slice(fromMonth);

    return (
        <div className="flex flex-col gap-3">
            {pastMonths.length > 0 && <PastMonths months={pastMonths} />}
            <MonthGrid months={currentMonths} />
        </div>
    );
}
