import Api from "@/lib/api";
import { Metadata, ResolvingMetadata } from "next";
import { IconCalendar, IconMapPin, IconWorld, IconPhone, IconMail } from "@tabler/icons-react";
import EventCoverImage from "@/components/event-cover-image";
import { notFound, permanentRedirect } from "next/navigation";
import AppLink from "@/components/ui/app-link";
import { Badge } from "@/components/ui/badge";
import { compile, run } from '@mdx-js/mdx'
import * as runtime from 'react/jsx-runtime'
import { createEventSlug, getEventIdFromSlug, formatPrice, formatPhone } from "@/lib/utils";
import GallerySection from "@/app/event/[id]/gallery-section";
import { Button } from "@/components/ui/button";
import H2 from "@/components/ui/h2";
import EventCardGrid from "@/components/event-card-grid";
import EventCard from "@/components/event-card";
import { Route } from "next";

type Props = {
    params: Promise<{ id: string }>
}

const getEventData = async (params: Props['params']) => {
    const resolvedParams = await params;
    const numericId = getEventIdFromSlug(resolvedParams.id);

    // First fetch the event
    const event = await Api.GET(`/v1/events/{event}`, {
        params: { path: { event: Number(numericId) } }
    }).then(res => res.data?.data);

    if (!event) {
        notFound();
    }

    const correctSlug = createEventSlug(event.title, numericId);
    if (resolvedParams.id !== correctSlug) {
        permanentRedirect(`/event/${correctSlug}`);
    }

    // Then fetch similar events using event data
    const similarEvents = await Api.GET('/v1/events', {
        params: {
            query: {
                industry_id: event.industry?.id,
                limit: 5,
            }
        }
    }).then(res => res.data?.data || []);

    const filteredSimilarEvents = similarEvents
        .filter(similar => similar.id !== event.id)
        .slice(0, 4);

    return {
        event,
        similarEvents: filteredSimilarEvents
    };
}

export async function generateMetadata({ params }: Props, parent: ResolvingMetadata): Promise<Metadata> {
    const { event } = await getEventData(params);

    console.log(await parent);
    const previousTitle = (await parent).title?.absolute;

    return {
        title: event?.title + ' — ' + previousTitle,
        description: event?.description,
        // TODO: use metadata from API
        // TODO: Add open graph and twitter metadata
    };
}

export default async function EventPage({ params }: Props) {
    const { event, similarEvents } = await getEventData(params);

    // Compile the MDX source code to a function body
    const code = String(
        await compile(event?.description ?? '', { outputFormat: 'function-body' })
    )

    // Run the compiled code with the runtime and get the default export
    const { default: Description } = await run(code, {
        ...runtime,
        baseUrl: import.meta.url,
    })

    return (
        <div className="flex flex-col gap-8">
            {/* Header */}
            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                    <div className="flex gap-4 text-lg">
                        <div className="flex items-center gap-2 bg-muted px-4 py-2 rounded-lg">
                            <IconCalendar className="w-6 h-6 text-brand" />
                            <span className="font-medium">
                                {new Date(event.start_date).toLocaleDateString('ru-RU')} - {new Date(event.end_date).toLocaleDateString('ru-RU')}
                            </span>
                        </div>
                        {event.city && (
                            <div className="flex items-center gap-2 bg-muted px-4 py-2 rounded-lg">
                                <IconMapPin className="w-6 h-6 text-brand" />
                                <span className="font-medium">{event.city.title}</span>
                            </div>
                        )}
                    </div>
                </div>
                <h1 className="text-4xl font-bold">{event.title}</h1>
            </div>

            {/* Cover Image */}
            <div className="flex gap-8">
                <div className="max-w-prose grow">
                    <EventCoverImage
                        cover={event.cover}
                        title={event.title}
                        size="lg"
                        priority={true}
                    />
                </div>

                {/* Sidebar */}
                <div className="flex min-w-[300px] flex-col justify-between gap-4">
                    <div className="flex flex-col gap-4">
                        <h3 className="font-semibold">Контакты</h3>
                        <div className="flex flex-col gap-2">
                            {event.website && (
                                <AppLink
                                    href={event.website as Route}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3"
                                >
                                    <IconWorld className="w-8 h-8 text-brand" />
                                    <div className="flex flex-col items-start">
                                        <span className="text-sm text-muted-foreground">Сайт</span>
                                        <span className="text-foreground">{new URL(event.website).hostname}</span>
                                    </div>
                                </AppLink>
                            )}
                            {event.phone && (
                                <AppLink
                                    href={`tel:${event.phone}`}
                                    className="flex items-center gap-3"
                                >
                                    <IconPhone className="w-8 h-8 text-brand" />
                                    <div className="flex flex-col items-start">
                                        <span className="text-sm text-muted-foreground">Телефон</span>
                                        <span className="text-foreground">{formatPhone(event.phone)}</span>
                                    </div>
                                </AppLink>
                            )}
                            {event.email && (
                                <AppLink
                                    href={`mailto:${event.email}`}
                                    className="flex items-center gap-3"
                                >
                                    <IconMail className="w-8 h-8 text-brand" />
                                    <div className="flex flex-col items-start">
                                        <span className="text-sm text-muted-foreground">Email</span>
                                        <span className="text-foreground">{event.email}</span>
                                    </div>
                                </AppLink>
                            )}
                        </div>
                    </div>

                    {/* Event Details */}
                    <div className="bg-gradient-to-r from-brand to-brand-dark rounded-lg p-4 text-white flex flex-col gap-4">
                        <h3 className="font-semibold">Детали мероприятия</h3>
                        <div className="flex flex-col gap-2">
                            {event.format_label && (
                                <div className="text-sm">
                                    <span className="text-muted-foreground">Формат:</span>{' '}
                                    <span className="capitalize">{event.format_label}</span>
                                </div>
                            )}
                            {event.industry && (
                                <div className="text-sm">
                                    <span className="text-muted-foreground">Индустрия:</span>{' '}
                                    <span>{event.industry.title}</span>
                                </div>
                            )}
                            {event.tariffs && event.tariffs.length > 0 && (
                                <div className="text-sm">
                                    <span className="text-muted-foreground">Стоимость:</span>{' от '}
                                    <span>{formatPrice(event.tariffs.sort((a, b) => a.price - b.price)[0].price)}</span>
                                </div>
                            )}
                        </div>
                    </div>


                </div>
            </div>

            {/* Content */}
            <div className="grid grid-cols-[1fr_300px] gap-8">
                <div className="flex flex-col gap-6">
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

                    {/* Description */}
                    <div className="prose max-w-none">
                        <Description />
                    </div>

                    {/* Gallery */}
                    {event.gallery && (
                        <GallerySection images={event.gallery} eventTitle={event.title} />
                    )}
                </div>
            </div>

            <H2>Похожие мероприятия</H2>

            <EventCardGrid>
                {similarEvents.map((event) => (
                    <EventCard key={event.id} event={event} />
                ))}
            </EventCardGrid>

        </div>
    );
}