import { Api } from "@/lib/api";
import { Metadata } from "next";
import { IconWorld, IconPhone, IconMail } from "@tabler/icons-react";
import { notFound, permanentRedirect } from "next/navigation";
import { compile, run } from '@mdx-js/mdx'
import * as runtime from 'react/jsx-runtime'
import { createSlugWithId, getIdFromSlug, formatPrice, formatPhone } from "@/lib/utils";
import H2 from "@/components/ui/h2";
import EventCardGrid from "@/components/event-card-grid";
import EventCard from "@/components/event-card";
import { Route } from "next";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Event, WithContext } from 'schema-dts'
import removeMarkdown from "remove-markdown";
import { ShareButtons } from "./share-buttons";
import AppLink from "@/components/ui/app-link";
import { truncateText, encodeUrl, formatEventDates } from "@/lib/utils";
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { z } from "zod";
import LocationMap from "./location-map";
import Breadcrumbs from "./breadcrumbs";
import Info from "./info";
import Images from "./images";
import SectionTitle from "./section-title";
import { Location } from "@/lib/types";



const getLocation = async (location: string): Promise<Location> => {
    console.log(location)

    const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${location}&limit=1&format=json`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    })

    const data = await response.json()

    return data[0]
}

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

    const title = `${event?.title} — ${event?.city?.title} ${event?.start_date ? new Date(event.start_date).toLocaleDateString('ru-RU', { month: 'long', day: 'numeric', year: 'numeric' }) : ''}`;
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

    const location = await getLocation(event.venue?.address || '');

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
            availability: 'https://schema.org/InStock',
            url: `https://workevent.ru/event/${createSlugWithId(event.title, event.id)}`,
            validFrom: event.start_date,
            validThrough: event.end_date,
        },
        eventStatus: 'https://schema.org/EventScheduled',
        eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    }

    const additionalIndustries = event.industries?.filter(industry => industry.id !== event.industry?.id).map(industry => industry.title).join(', ');

    const formSchema = z.object({
        name: z.string().min(3, { message: 'Имя должно содержать минимум 3 символа' }),
        email: z.string().email({ message: 'Некорректный email' }),
        phone: z.string().min(10, { message: 'Телефон должен содержать минимум 10 символов' }),
        comment: z.string().optional(),
    });



    return (

        <div className="flex flex-col gap-10">
            {/* JSON-LD */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* Breadcrumbs */}
            <Breadcrumbs event={event} />

            {/* Product Card */}
            <div className="flex gap-8">
                <Images event={event} />
                <Info event={event} />
            </div>

            {/* Description */}
            <div className="prose max-w-prose">
                <SectionTitle title="О мероприятии" />
                <Description />
            </div>

            {/* Map */}
            {location && <div className="flex flex-col gap-6" id="map">
                <SectionTitle title="Местоположение" />
                <LocationMap location={location} event={event} />
            </div>} 

            {/* Form */}
            <div className="flex flex-col gap-6 bg-secondary px-10 py-8 rounded-lg max-w-[1000px]">
                <SectionTitle title="Оставьте заявку на участие" />

                <div className="flex gap-2">
                    <Input placeholder="ФИО" />
                    <Input placeholder="Электронная почта" />
                    <Input placeholder="Телефон" />
                </div>

                <Textarea placeholder="Комментарий" />

                <div className="text-xs text-muted-foreground-dark">Нажимая на кнопку, вы соглашаетесь с <AppLink href={`/privacy-policy` as Route} variant="underline">политикой конфиденциальности</AppLink></div>
                <div className="flex">
                    <Button variant="primary">Оставить заявку</Button>
                </div>
            </div>

            {/* Contacts Section */}
            <div className="flex flex-col gap-6 bg-muted p-4 rounded-lg">
                {/* Dates */}
                {event.start_date && event.end_date && (
                    <div className="flex flex-col gap-2">
                        <span className="text-sm text-muted-foreground">Дата проведения мероприятия</span>
                        <span className="text-lg font-bold">{formatEventDates(event)}</span>
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
                        <span className="">{event.venue.address}</span>
                    </div>
                )}

                {/* Contacts */}
                <div className="flex flex-col gap-2">
                    <span className="text-sm text-muted-foreground">Контакты организатора</span>
                    <div className="flex flex-row gap-x-4 gap-y-2 flex-wrap">
                        {event.website && (
                            <Button
                                asChild
                                variant="primary"
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
                                variant="primary"
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
                                variant="primary"
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
                    <Button variant="success" size="xl" asChild>
                        <Link href={encodeUrl(event.website, { utm_campaign: 'participate' })}>Участвовать</Link>
                    </Button>
                )}

                {/* Share Buttons */}
                <div className="flex flex-col gap-2">
                    <span className="text-sm text-muted-foreground">Поделиться</span>
                    <ShareButtons url={`https://workevent.ru/event/${createSlugWithId(event.title, event.id)}`} title={event.title} image={event.cover} />
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
                                <Button variant="default" asChild>
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