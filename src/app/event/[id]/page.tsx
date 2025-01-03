import Api from "@/lib/api";
import { Metadata, ResolvingMetadata } from "next";
import { IconCalendar, IconMapPin, IconWorld, IconPhone, IconMail } from "@tabler/icons-react";
import EventCoverImage from "@/components/event-cover-image";
import { notFound, permanentRedirect } from "next/navigation";
import AppLink from "@/components/ui/app-link";
import { Badge } from "@/components/ui/badge";
import { compile, run } from '@mdx-js/mdx'
import * as runtime from 'react/jsx-runtime'
import { createSlugWithId, getIdFromSlug, formatPrice, formatPhone } from "@/lib/utils";
import GallerySection from "@/app/event/[id]/gallery-section";
import H2 from "@/components/ui/h2";
import EventCardGrid from "@/components/event-card-grid";
import EventCard from "@/components/event-card";
import { Route } from "next";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type Props = {
    params: Promise<{ id: string }>
}

export const revalidate = 36000;

export async function generateStaticParams() {
    const events = await Api.GET('/v1/events/ids')
        .then(res => res.data?.data || []);

    return events.map((event) => ({
        id: String(event.id),
    }))
}

const getEventData = async (params: Props['params']) => {
    const resolvedParams = await params;
    const numericId = getIdFromSlug(resolvedParams.id);

    // First fetch the event
    const responseData = await Api.GET(`/v1/events/{event}`, {
        params: { path: { event: Number(numericId) } }
    }).then(res => res.data);

    const event = responseData?.data;
    const presets = responseData?.presets;

    if (!event) {
        notFound();
    }

    const correctSlug = createSlugWithId(event.title, numericId);
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
        similarEvents: filteredSimilarEvents,
        presets
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
    const { event, similarEvents, presets } = await getEventData(params);

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
        <div className="flex flex-col gap-16">
            <div className="flex flex-col gap-8">
                {/* D */}
                <div className="flex gap-x-4 gap-y-2 md:flex-row flex-col md:text-lg">
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

                {/* Header */}
                <div className="flex flex-col gap-6">

                    <h1 className="md:text-4xl text-2xl font-bold">{event.title}</h1>
                </div>

                {/* Cover Image */}
                <div className="flex flex-col md:flex-row gap-8">
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
                        <div className="bg-gradient-to-r from-brand to-brand-dark rounded-lg p-4 text-white flex flex-col gap-4">
                            <h3 className="font-semibold">Контакты</h3>
                            <div className="flex flex-col gap-2">
                                {event.website && (
                                    <AppLink
                                        href={event.website as Route}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3"
                                    >
                                        <IconWorld className="w-8 h-8 text-secondary" />
                                        <div className="flex flex-col items-start">
                                            <span className="text-sm text-muted-foreground">Сайт</span>
                                            <span className="text-secondary">{new URL(event.website).hostname}</span>
                                        </div>
                                    </AppLink>
                                )}
                                {event.phone && (
                                    <AppLink
                                        href={`tel:${event.phone}`}
                                        className="flex items-center gap-3"
                                    >
                                        <IconPhone className="w-8 h-8 text-secondary" />
                                        <div className="flex flex-col items-start">
                                            <span className="text-sm text-muted-foreground">Телефон</span>
                                            <span className="text-secondary">{formatPhone(event.phone)}</span>
                                        </div>
                                    </AppLink>
                                )}
                                {event.email && (
                                    <AppLink
                                        href={`mailto:${event.email}`}
                                        className="flex items-center gap-3"
                                    >
                                        <IconMail className="w-8 h-8 text-secondary" />
                                        <div className="flex flex-col items-start">
                                            <span className="text-sm text-muted-foreground">Email</span>
                                            <span className="text-secondary">{event.email}</span>
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
                    <div className="prose max-w-none text-sm">
                        <Description />
                    </div>


                    {/* Gallery */}
                    {event.gallery && (
                        <GallerySection images={event.gallery} eventTitle={event.title} />
                    )}
                </div>
            </div>

            {/* Contacts Section */}
            <div className="flex flex-col gap-6 bg-muted p-4 rounded-lg">
                {/* Dates */}
                <div className="flex flex-col gap-2">
                    <span className="text-sm text-muted-foreground">Дата</span>
                    <span className="text-lg font-bold">{new Date(event.start_date).toLocaleDateString('ru-RU')} - {new Date(event.end_date).toLocaleDateString('ru-RU')}</span>
                </div>

                {/* Location */}
                <div className="flex flex-col gap-2">
                    <span className="text-sm text-muted-foreground">Город</span>
                    <span className="text-lg font-bold">{event.city?.title}</span>
                </div>

                {/* Venue */}
                <div className="flex flex-col gap-2">
                    <span className="text-sm text-muted-foreground">Место проведения</span>
                    <span className="text-lg font-bold">{event.venue?.title}</span>
                    <span className="text-lg">{event.venue?.address}</span>
                </div>

                {/* Contacts */}
                <div className="flex flex-col gap-2">
                    <span className="text-sm text-muted-foreground">Контакты организатора</span>
                    <div className="flex flex-row gap-4">
                        {event.website && (
                            <Button
                                asChild
                                variant="brand"
                                size="xl"
                            >
                                <Link
                                    className="flex items-center gap-2"
                                    href={event.website as Route}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <IconWorld />
                                    <span>{new URL(event.website).hostname}</span>
                                </Link>
                            </Button>
                        )}
                        {event.phone && (
                            <Button
                                asChild
                                variant="brand"
                                size="xl"
                            >
                                <Link
                                    className="flex items-center gap-2"
                                    href={`tel:${event.phone}`}
                                >
                                    <IconPhone />
                                    <span>{formatPhone(event.phone)}</span>
                                </Link>
                            </Button>
                        )}
                        {event.email && (
                            <Button
                                asChild
                                variant="brand"
                                size="xl"
                            >
                                <Link
                                    className="flex items-center gap-2"
                                    href={`mailto:${event.email}`}
                                >
                                    <IconMail />
                                    <span>{event.email}</span>
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>
            </div>


            {/* Similar Events */}
            {similarEvents.length > 0 && (
                <div className="flex flex-col gap-8">
                    <H2>Похожие мероприятия</H2>

                    <EventCardGrid>
                        {similarEvents.map((event) => (
                            <EventCard key={event.id} event={event} />
                        ))}
                    </EventCardGrid>
                </div>
            )}

            {/* Presets */}
            {presets && presets.length > 0 && (
                <div className="flex flex-col gap-8">
                    <H2>Подборки</H2>

                    <div className="flex flex-wrap gap-2">
                        {presets.map(preset => (
                            <div className="w-full md:w-auto overflow-x-auto" key={preset.id}>
                                <Button variant="outline" asChild>
                                    <Link href={`/events/${preset.slug}`}>{preset.title}</Link>
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}