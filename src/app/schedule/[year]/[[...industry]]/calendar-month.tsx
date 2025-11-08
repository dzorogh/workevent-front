import {createSlugWithId, formatEventDates, plural} from "@/lib/utils";
import {Route} from "next";
import Link from "next/link";
import {useState, useRef, useEffect} from "react";
import {EventResource} from "@/lib/types";
import {HoverCard, HoverCardContent, HoverCardTrigger} from "@/components/ui/hover-card";
import EventCoverImage from "@/components/event-cover-image";
import {IconMapPin} from "@tabler/icons-react";
import {Badge} from "@/components/ui/badge";

interface Month {
    name: string;
    events: EventResource[];
}

export default function CalendarMonth({month}: { month: Month }) {

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
                <div className="flex flex-col md:flex-row justify-between gap-2">
                    <div className="text-xl font-semibold">{month.name}</div>
                    <div className="text-sm text-muted-foreground font-normal whitespace-nowrap">
                        {month.events.length > 0 ? `${month.events.length} ${plural(['мероприятие', 'мероприятия', 'мероприятий'], month.events.length)}` : ''}
                        {month.events.length === 0 && "Нет мероприятий"}
                    </div>
                </div>

                <div
                    ref={ref}
                    className={`${month.events.length > 0 ? 'flex' : 'hidden md:flex'} flex-col ${isExpanded ? 'h-auto' : 'md:h-[300px] overflow-y-hidden transition-[height] relative'}`}
                >
                    <div className="flex flex-col">
                        {month.events.sort((a, b) => new Date(a.start_date).getDate() - new Date(b.start_date).getDate()).map((event) => (
                            <HoverCard key={event.id}>
                                <HoverCardTrigger href={`/event/${createSlugWithId(event.title, event.id)}` as Route}
                                                  className="border-b last:border-b-0 border-border py-2 flex gap-4 justify-start items-baseline">
                                    <div className="w-4 flex shrink-0 text-muted-foreground-dark text-sm">
                                        {new Date(event.start_date).getDate()}
                                    </div>
                                    <div className="">
                                        {event.title}
                                    </div>
                                </HoverCardTrigger>
                                <HoverCardContent side="right" className="p-8 w-80">
                                    <Link href={`/event/${createSlugWithId(event.title, event.id)}` as Route}
                                          className="block">
                                        <div className="flex flex-col gap-5">
                                            <EventCoverImage cover={event.cover} title={event.title}/>

                                            <div className="flex flex-col gap-2">
                                                <div className="">{event.title}</div>

                                                <div
                                                    className="text-muted-foreground-dark text-sm">{formatEventDates(event)}</div>

                                                <div>
                                                    <Badge>{event.industry?.title}</Badge>
                                                </div>

                                                <div className="text-primary-darker text-sm flex gap-1">
                                                    {event.city?.title}
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </HoverCardContent>
                            </HoverCard>
                        ))}
                    </div>
                    {(isLoading || (isExpandable && !isExpanded)) && <div
                        className="h-16 bg-linear-to-b from-transparent to-background absolute bottom-0 left-0 w-full"></div>}
                </div>

                <div className={`flex flex-col md:h-4 ${isExpandable ? 'flex' : 'hidden md:flex'}`}>
                    {isLoading && (<div className="w-32 h-full bg-muted animate-pulse rounded-lg"></div>)}
                    {isExpandable && (
                        <button className="text-sm text-left text-primary cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                            {isExpanded ? 'Свернуть' : 'Показать еще'}
                        </button>)}
                </div>
            </div>
        </div>
    </div>
}
