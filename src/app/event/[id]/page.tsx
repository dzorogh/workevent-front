import { Api } from "@/lib/api";
import { Metadata, ResolvingMetadata } from "next";
import { IconCalendar, IconMapPin, IconWorld, IconPhone, IconMail, IconBriefcase, IconCoin, IconStar } from "@tabler/icons-react";
import EventCoverImage from "@/components/event-cover-image";
import { notFound, permanentRedirect } from "next/navigation";
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
import { Event, WithContext } from 'schema-dts'
import removeMarkdown from "remove-markdown";
import { truncateText, encodeUrl } from "@/lib/utils";

type Props = {
    params: Promise<{ id: string }>
}

export const revalidate = false;

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



export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { event } = await getEventData(params);

    const title = event?.title + ' — Workevent';
    const description = truncateText(removeMarkdown(event?.description ?? ''), 150);

    return {
        title: title,
        description: description,
        openGraph: {
            type: 'website',
            title: title,
            description: description,
            images: [event?.cover],
            url: `${process.env.NEXT_PUBLIC_SITE_URL}/event/${createSlugWithId(event.title, event.id)}`,
        },
        twitter: {
            title: title,
            description: description,
            images: [event?.cover],
        }
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

    const jsonLd: WithContext<Event> = {
        '@context': 'https://schema.org',
        '@type': 'Event',
        name: event.title,
        description: event.description ?? event.title,
        startDate: event.start_date,
        endDate: event.end_date,
        location: event.venue ? {
            '@type': 'Place',
            name: event.venue.title,
            address: event.venue.address ?? event.city?.title,
        } : event.city ? {
            '@type': 'Place',
            name: event.city.title,
        } : undefined,
        image: event.cover,
        url: `https://workevent.ru/event/${createSlugWithId(event.title, event.id)}`,
        offers: {
            '@type': 'Offer',
            price: event.tariffs?.sort((a, b) => a.price - b.price)[0]?.price,
            priceCurrency: 'RUB',
        },
        eventStatus: 'https://schema.org/EventScheduled',
        eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    }

    const additionalIndustries = event.industries?.filter(industry => industry.id !== event.industry?.id).map(industry => industry.title).join(', ');

    return (
        <div className="flex flex-col gap-16">
            <div className="flex flex-col gap-8">
                {/* JSON-LD */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />

                {/* Header */}
                <div className="flex flex-col gap-6">
                    <h1 className="md:text-4xl text-2xl font-bold">{event.title}</h1>
                </div>

                {/* Cover Image */}
                <EventCoverImage
                    cover={event.cover}
                    title={event.title}
                    size="lg"
                    priority={true}
                />

                <div className="flex flex-col md:flex-row gap-8">
                    {event.website && (
                        <div className="flex flex-col gap-4 min-w-[300px]">
                            <Button variant="brand" asChild size="xl">
                                <Link href={encodeUrl(event.website, { utm_campaign: 'participate' })}>Участвовать</Link>
                            </Button>
                            <Button variant="brand" asChild>
                                <Link href={encodeUrl(event.website, { utm_campaign: 'official_site' })}>Официальный сайт</Link>
                            </Button>
                            <Button variant="brand" asChild>
                                <Link href={encodeUrl(event.website, { utm_campaign: 'add_to_calendar' })}>Добавить в календарь</Link>
                            </Button>
                        </div>
                    )}
                    <div className="flex flex-col gap-4 justify-between">
                        <div className="flex flex-wrap gap-x-4 gap-y-2 md:flex-row flex-col md:text-lg">
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

                            {event.industry && (
                                <div className="flex items-center gap-2 bg-muted px-4 py-2 rounded-lg">
                                    <IconBriefcase className="w-6 h-6 text-brand" />
                                    <span className="font-medium">{event.industry.title}</span>
                                </div>
                            )}

                            {event.tariffs && event.tariffs.length > 0 && (
                                <div className="flex items-center gap-2 bg-muted px-4 py-2 rounded-lg">
                                    <IconCoin className="w-6 h-6 text-brand" />
                                    <span className="font-medium">{'от '}{formatPrice(event.tariffs.sort((a, b) => a.price - b.price)[0].price)}</span>
                                </div>
                            )}

                            {event.format_label && (
                                <div className="flex items-center gap-2 bg-muted px-4 py-2 rounded-lg">
                                    <IconStar className="w-6 h-6 text-brand" />
                                    <span className="font-medium">{event.format_label}</span>
                                </div>
                            )}
                        </div>

                        <div>
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

                            {additionalIndustries && (
                                <div className="flex flex-wrap gap-2">
                                    {additionalIndustries.split(',').map((industry, index) => (
                                        <Badge key={index}>{industry}</Badge>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div className="prose max-w-prose">
                    <Description />
                </div>

                {/* Gallery */}
                {event.gallery && (
                    <GallerySection images={event.gallery} eventTitle={event.title} size="lg" />
                )}
            </div>

            {/* Contacts Section */}
            <div className="flex flex-col gap-6 bg-muted p-4 rounded-lg">
                {/* Dates */}
                {event.start_date && event.end_date && (
                    <div className="flex flex-col gap-2">
                        <span className="text-sm text-muted-foreground">Дата</span>
                        <span className="text-lg font-bold">{new Date(event.start_date).toLocaleDateString('ru-RU')} - {new Date(event.end_date).toLocaleDateString('ru-RU')}</span>
                    </div>
                )}

                {/* Location */}
                {event.city && (
                    <div className="flex flex-col gap-2">
                        <span className="text-sm text-muted-foreground">Город</span>
                        <span className="text-lg font-bold">{event.city.title}</span>
                    </div>
                )}

                {/* Venue */}
                {event.venue && (
                    <div className="flex flex-col gap-2">
                        <span className="text-sm text-muted-foreground">Место проведения</span>
                        <span className="text-lg font-bold">{event.venue.title}</span>
                    </div>
                )}

                {/* Contacts */}
                <div className="flex flex-col gap-2">
                    <span className="text-sm text-muted-foreground">Контакты организатора</span>
                    <div className="flex flex-row gap-x-4 gap-y-2 flex-wrap">
                        {event.website && (
                            <Button
                                asChild
                                variant="brand"
                                size="lg"
                            >
                                <Link
                                    className="flex items-center gap-2"
                                    href={event.website as Route}
                                    target="_blank"
                                    rel="noopener noreferrer nofollow"
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
                                size="lg"
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
                                size="lg"
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

                {/* Participate Button */}
                {event.website && ( 
                    <Button variant="primary" size="xl" asChild>
                        <Link href={encodeUrl(event.website, { utm_campaign: 'participate' })}>Участвовать</Link>
                    </Button>
                )}
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