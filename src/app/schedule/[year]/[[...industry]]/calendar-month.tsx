import { createSlugWithId, formatEventDates, plural } from "@/lib/utils";
import { Route } from "next";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { EventResource } from "@/lib/types";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import EventCoverImage, { prefetchEventCover } from "@/components/event-cover-image";
import { IconMapPin } from "@tabler/icons-react";

interface Month {
    name: string;
    events: EventResource[];
}

function CalendarEventRow({ event }: { event: EventResource }) {
    const href = `/event/${createSlugWithId(event.title, event.id)}` as Route;

    return (
        <HoverCard openDelay={200} closeDelay={100}>
            <HoverCardTrigger asChild>
                <Link
                    href={href}
                    onPointerEnter={() => prefetchEventCover(event.cover, 'sm', '320px')}
                    className="flex items-baseline gap-3 border-b border-[#EEF1F7] py-2.5 last:border-b-0"
                >
                    <div className="w-6 shrink-0 text-[13px] font-medium tabular-nums text-[#4545EF]">
                        {new Date(event.start_date).getDate()}
                    </div>
                    <div className="min-w-0 text-[14px] leading-5 text-[#090D2B]">
                        {event.title}
                    </div>
                </Link>
            </HoverCardTrigger>
            <HoverCardContent side="right" className="w-80 rounded-[16px] border-0 bg-white p-4 shadow-[0_8px_32px_rgba(9,13,43,0.12)]">
                <Link href={href} className="block">
                    <div className="flex flex-col gap-4">
                        <EventCoverImage
                            cover={event.cover}
                            title={event.title}
                            className="rounded-[12px]"
                            sizes="320px"
                        />
                        <div className="flex flex-col gap-2">
                            <div className="font-semibold leading-snug text-[#090D2B]">{event.title}</div>
                            <div className="text-[13px] text-[#657087]">{formatEventDates(event)}</div>
                            {event.industry?.title && (
                                <div className="text-[13px] text-[#4545EF]">{event.industry.title}</div>
                            )}
                            {event.city?.title && (
                                <div className="inline-flex items-center gap-1 text-[13px] text-[#657087]">
                                    <IconMapPin className="size-4" stroke={1.75} />
                                    {event.city.title}
                                </div>
                            )}
                        </div>
                    </div>
                </Link>
            </HoverCardContent>
        </HoverCard>
    );
}

export default function CalendarMonth({ month }: { month: Month }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isExpandable, setIsExpandable] = useState<boolean | undefined>(undefined);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setIsExpandable(Boolean(ref.current?.scrollHeight && ref.current.scrollHeight > 300));
    }, [month.events.length]);

    const countLabel = month.events.length > 0
        ? `${month.events.length} ${plural(['мероприятие', 'мероприятия', 'мероприятий'], month.events.length)}`
        : 'Нет мероприятий';

    return (
        <div className="flex flex-col rounded-[16px] bg-white px-5 py-5">
            <div className="flex items-baseline justify-between gap-3">
                <div className="text-[18px] font-semibold tracking-tight text-[#090D2B]">{month.name}</div>
                <div className="text-[13px] text-[#657087] whitespace-nowrap">{countLabel}</div>
            </div>

            <div
                ref={ref}
                className={`${month.events.length > 0 ? 'mt-4 flex flex-col' : 'hidden'} ${isExpanded ? 'h-auto' : 'min-[768px]:max-h-[300px] min-[768px]:overflow-y-hidden relative'}`}
            >
                <div className="flex flex-col">
                    {month.events
                        .slice()
                        .sort((a, b) => new Date(a.start_date).getDate() - new Date(b.start_date).getDate())
                        .map((event) => (
                            <CalendarEventRow key={event.id} event={event} />
                        ))}
                </div>
                {isExpandable && !isExpanded && (
                    <div className="pointer-events-none absolute bottom-0 left-0 h-16 w-full bg-linear-to-b from-transparent to-white" />
                )}
            </div>

            {isExpandable && (
                <button
                    type="button"
                    className="mt-3 hidden text-left text-[14px] text-[#4545EF] hover:text-[#3838d4] min-[768px]:inline"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    {isExpanded ? 'Свернуть' : 'Показать ещё'}
                </button>
            )}
        </div>
    );
}
