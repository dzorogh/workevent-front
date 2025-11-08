import { Api } from "@/lib/api";
import { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { compile, run } from '@mdx-js/mdx'
import * as runtime from 'react/jsx-runtime'
import { createSlugWithId, getIdFromSlug } from "@/lib/utils";
import EventCardGrid from "@/components/event-card-grid";
import EventCard from "@/components/event-card";
import { Route } from "next";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Event, WithContext } from 'schema-dts'
import removeMarkdown from "remove-markdown";
import { truncateText } from "@/lib/utils";
import LocationMap from "./location-map";
import Breadcrumbs from "./breadcrumbs";
import Info from "./info";
import Images from "./images";
import SectionTitle from "./section-title";
import { Location } from "@/lib/types";
import Form from "./form";
import Tags from "./tags";
import Contacts from "./contacts";
import CalendarComponent from "./calendar";
import Description from "../../../components/description";
import { Separator } from "@/components/ui/separator";

const getLocation = async (location: string): Promise<Location | null> => {
    console.log(location)

    const url = new URL(`https://nominatim.openstreetmap.org/search`)
    url.searchParams.set('q', location.trim())
    url.searchParams.set('limit', '1')
    url.searchParams.set('format', 'json')

    try {
        const response = await fetch(url.toString(), {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        })

        if (!response.ok) {
            console.error('HTTP error! status:', {
                url: response.url,
                status: response.status,
                statusText: response.statusText,
                contentType: response.headers.get('content-type'),
                body: (await response.text()).substring(0, 200) // Первые 200 символов для отладки
            })
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()

        if (!data || !Array.isArray(data) || data.length === 0) {
            throw new Error('No location data found')
        }

        return data[0]
    } catch (error) {
        console.error('Error fetching location:', error)
        // Возвращаем базовый объект локации в случае ошибки
        return null;
    }
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

const prepareAddress = (address: string, city: string) => {
    const addressString = address || city
    // remove special characters and ' д ' because it breaks the search
    return addressString.replace(/[^a-zA-Z0-9а-яА-Я\s]/g, '').replace(' д ', ' ')
}

export default async function EventPage({ params }: Props) {
    const { event, similarEvents, presets } = await getEventData(params);


    const preparedAddress = prepareAddress(event.venue?.address ?? '', event.city?.title ?? '');
    const location = await getLocation(preparedAddress);
    console.log({ preparedAddress })

    // Compile the MDX source code to a function body
    const code = String(
        await compile(event.description ?? '', { outputFormat: 'function-body' })
    )

    // Run the compiled code with the runtime and get the default export
    const { default: DescriptionMDX } = await run(code, {
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

    return (

        <div className="flex flex-col md:gap-16 gap-8">
            {/* JSON-LD */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* Breadcrumbs */}
            <Breadcrumbs event={event} />

            {/* Product Card */}
            <div className="flex flex-col md:flex-row md:gap-8 gap-4">
                <Images event={event} className="md:basis-1/2" />
                <Info event={event} className="md:basis-1/2" />
            </div>

            <Separator />

            {/* Description */}
            <div className="flex flex-col md:flex-row gap-8">
                <div className="flex flex-col gap-6 grow">
                    <SectionTitle>О мероприятии</SectionTitle>
                    <Description>
                        <DescriptionMDX />
                    </Description>
                </div>
                <div className="flex flex-col gap-6">
                    <SectionTitle>Дата мероприятия</SectionTitle>
                    <CalendarComponent event={event} />
                </div>
            </div>

            {/* Map */}
            {location &&
                <>
                    <Separator />
                    <div className="flex flex-col gap-6" id="map">
                        <SectionTitle>Местоположение</SectionTitle>
                        <LocationMap location={location} event={event} />
                    </div>
                </>
            }

            {/* Form */}
            <div className="flex flex-col gap-6 -mx-4 md:mx-0 bg-secondary md:px-10 px-4 md:py-8 py-12 md:rounded-lg -mt-8 md:mt-0 max-w-[1000px]">
                <SectionTitle className="text-center md:text-left">Оставьте заявку на участие</SectionTitle>
                <Form />
            </div>

            {/* Tags */}
            {event.tags && event.tags.length > 0 && (
                <>
                    <Separator />
                    <div className="flex flex-col gap-6">
                        <SectionTitle>Темы мероприятия</SectionTitle>
                        <Tags tags={event.tags} />
                    </div>
                </>
            )}

            {/* Contacts */}
            {(event.website || event.email || event.phone) && (
                <>
                    <Separator />
                    <div className="flex flex-col gap-6">
                        <SectionTitle>Контакты организатора</SectionTitle>
                        <Contacts event={event} />
                    </div>
                </>
            )}

            {/* Similar Events */}
            {similarEvents.length > 0 && (
                <>
                    <Separator />
                    <div className="flex flex-col gap-6">
                        <SectionTitle>Похожие мероприятия</SectionTitle>

                        <EventCardGrid>
                            {similarEvents.map((event) => (
                                <EventCard key={event.id} event={event} />
                            ))}
                        </EventCardGrid>
                    </div>
                </>
            )}


            {/* Presets */}
            {presets && presets.length > 0 && (
                <>
                    <Separator />
                    <div className="flex flex-col gap-6">
                        <SectionTitle>Подборки</SectionTitle>

                        <div className="flex flex-wrap gap-2">
                            {presets.map(preset => (
                                <div className="w-full md:w-auto overflow-x-auto" key={preset.id}>
                                    <Button variant="default" asChild>
                                        <Link href={`/events/${preset.slug}` as Route}>{preset.title}</Link>
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
