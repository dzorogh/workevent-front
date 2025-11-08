import { EventResource } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { formatEventDates, formatPrice } from "@/lib/utils";
import { Route } from "next";
import removeMarkdown from "remove-markdown";
import InfoLabel from "./info-label";
import Tags from "./tags";
import { encodeUrl } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

interface InfoProps {
    event: EventResource
    className?: string
}

export default function Info({ event, className }: InfoProps) {
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

    const additionalIndustries = event.industries?.filter(industry => industry.id !== event.industry?.id).map(industry => industry.title).join(', ');


    return (
        <div className={cn("flex flex-col gap-6", className)}>
            <h1 className="md:text-3xl text-xl font-semibold">{event.title}</h1>

            {/* Tags */}
            {event.tags && event.tags.length > 0 && (
                <Tags tags={event.tags} />
            )}

            {/* Additional info */}
            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                    <InfoLabel label="Дата проведения" />
                    <div className="font-medium">{formatEventDates(event)}</div>
                </div>

                <div className="flex flex-col md:flex-row gap-4 max-w-[550px]">
                    <Button variant="primary" size="lg" asChild className="md:basis-1/2 w-full">
                        <Link target="_blank" href={encodeUrl(event.website ?? '', { utm_campaign: 'participate' }) as Route}>Принять участие</Link>
                    </Button>
                    {/* <Button variant="default" size="lg" asChild className="md:basis-1/2 w-full">
                        <Link target="_blank" href={googleCalendarRoute()}>Добавить в календарь</Link>
                    </Button> */}
                </div>

                <Separator />

                <div className="flex flex-col gap-2">
                    <InfoLabel label="Город" />
                    <div className="font-medium">{event.city?.title}</div>
                </div>

                {event.venue &&
                    <div className="flex flex-col gap-2">
                        <InfoLabel label="Место проведения" />
                        <div className="font-medium">{event.venue?.title ? `${event.venue.title}` : ''}{event.venue?.title && event.venue?.address ? ', ' : ''}{event.venue?.address ? `${event.venue.address}` : ''}</div>
                    </div>
                }

                {event.tariffs && event.tariffs.length > 0 && (
                    <div className="flex flex-col gap-2">
                        <InfoLabel label="Стоимость" />
                        <div className="font-medium">от {formatPrice(event.tariffs?.sort((a, b) => a.price - b.price)[0]?.price)}</div>
                    </div>
                )}

                <Separator />

                {/* Format */}
                {event.format_label && (
                    <div className="flex flex-col gap-2">
                        <InfoLabel label="Формат мероприятия" />
                        <div className="font-medium">{event.format_label}</div>
                    </div>
                )}

                {/* Industry */}
                {event.industry && (
                    <div className="flex flex-col gap-2">
                        <InfoLabel label="Отрасль" />
                        <div className="font-medium">{event.industry.title}{additionalIndustries ? `, ${additionalIndustries}` : ''}</div>
                    </div>
                )}
            </div>
        </div>
    )
}