import { EventResource } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { formatEventDates, formatPrice } from "@/lib/utils";
import { Route } from "next";
import removeMarkdown from "remove-markdown";
import InfoLabel from "./info-label";

interface InfoProps {
    event: EventResource
}

export default function Info({ event }: InfoProps) {
    const googleCalendarRoute = (): Route => {
        const url = new URL('https://calendar.google.com/calendar/u/0/r/eventedit');
        url.searchParams.set('text', event.title);
        url.searchParams.set('dates', `${event.start_date.replace(/-/g, '')}T100000/${event.end_date.replace(/-/g, '')}T180000`);
        url.searchParams.set('ctz', 'Europe/Moscow');
        url.searchParams.set('details', removeMarkdown(event.description ?? event.title));
        url.searchParams.set('location', event.city?.title ?? '' + (event.venue?.title ? `, ${event.venue.address}` : ''));
        url.searchParams.set('pli', '1');
        url.searchParams.set('uid', 'workevent' + event.id.toString());
        url.searchParams.set('sf', 'true');
        url.searchParams.set('output', 'xml');

        return url.toString() as Route;
    }

    return (
        <div className="flex flex-col gap-6 w-1/2 pt-2">
            <h1 className="md:text-3xl text-2xl font-semibold">{event.title}</h1>

            {/* Tags */}
            {event.tags && event.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {event.tags.map((tag, index) => (
                        <Badge
                            key={tag.id}
                        >
                            {tag.title}
                        </Badge>
                    ))}
                </div>
            )}

            {/* Additional info */}
            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                    <InfoLabel label="Дата проведения" />
                    <div className="font-semibold">{formatEventDates(event)}</div>
                </div>

                <div className="flex flex-col gap-2">
                    <InfoLabel label="Город" />
                    <div className="font-semibold">{event.city?.title}</div>
                </div>

                {event.tariffs && event.tariffs.length > 0 && (
                    <div className="flex flex-col gap-2">
                        <InfoLabel label="Стоимость" />
                        <div className="font-semibold">от {formatPrice(event.tariffs?.sort((a, b) => a.price - b.price)[0]?.price)}</div>
                    </div>
                )}

                {event.venue &&
                    <div className="flex flex-col gap-2">
                        <InfoLabel label="Место проведения" />
                        <div className="font-semibold">{event.venue?.title ? `${event.venue.title}` : ''}{event.venue?.title && event.venue?.address ? ', ' : ''}{event.venue?.address ? `${event.venue.address}` : ''}</div>
                        <div className="text-xs">
                            <a href="#map" className="text-primary">Показать на карте</a>
                        </div>
                    </div>
                }

                {/* Format */}
                {event.format_label && (
                    <div className="flex flex-col gap-2">
                        <InfoLabel label="Формат мероприятия" />
                        <div className="font-semibold">{event.format_label}</div>
                    </div>
                )}

                {/* Industry */}
                {event.industry && (
                    <div className="flex flex-col gap-2">
                        <InfoLabel label="Отрасль" />
                        <div className="font-semibold">{event.industry.title}</div>
                    </div>
                )}
            </div>

            <div className="flex gap-4 max-w-[550px]">
                <Button variant="primary" size="lg" asChild className="basis-1/2">
                    <Link href={googleCalendarRoute()}>Принять участие</Link>
                </Button>
                <Button variant="default" size="lg" asChild className="basis-1/2">
                    <Link href={googleCalendarRoute()}>Добавить в календарь</Link>
                </Button>
            </div>
        </div>
    )
}