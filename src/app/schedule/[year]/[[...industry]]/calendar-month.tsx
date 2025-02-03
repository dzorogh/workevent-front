import { createSlugWithId, plural } from "@/lib/utils";
import { Route } from "next";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { EventResource } from "@/lib/types";

interface Month {
    name: string;
    events: EventResource[];
}

export default function CalendarMonth({ month }: { month: Month }) {

    const [isExpanded, setIsExpanded] = useState(false);
    const [isExpandable, setIsExpandable] = useState<boolean | undefined>(undefined);
    const ref = useRef<HTMLDivElement>(null);

    const isLoading = isExpandable === undefined;

    useEffect(() => {
        setIsExpandable(Boolean(ref.current?.scrollHeight && ref.current?.scrollHeight > 300));
    }, [ref.current])

    return <div>
        <div className="flex flex-col border border-border p-8 rounded-lg">
            <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                    <div className="text-xl font-semibold">{month.name}</div>
                    <div className="text-sm text-muted-foreground font-normal">
                        {month.events.length} {plural(['мероприятие', 'мероприятия', 'мероприятий'], month.events.length)}
                    </div>
                </div>
                <div
                    ref={ref}
                    className={`flex flex-col ${isExpanded ? 'h-auto' : 'h-[300px] overflow-y-hidden transition-[height] relative'}`}
                >
                    <div className="flex flex-col gap-2">
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
                    {(isLoading || (isExpandable && !isExpanded)) && <div className="h-16 bg-gradient-to-b from-transparent to-background absolute bottom-0 left-0 w-full"></div>}
                </div>

                <div className="flex h-4">
                    {isLoading && (<div className="w-32 h-full bg-muted animate-pulse rounded-lg"></div>)}
                    {isExpandable && (<button className="text-sm text-primary" onClick={() => setIsExpanded(!isExpanded)}>
                        {isExpanded ? 'Свернуть' : 'Показать еще'}
                    </button>)}
                </div>
            </div>
        </div>
    </div>
}