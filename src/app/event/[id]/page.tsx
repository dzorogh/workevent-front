import type { ComponentProps } from "react";
import { Api } from "@/lib/api";
import { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { compile, run } from '@mdx-js/mdx'
import * as runtime from 'react/jsx-runtime'
import { createSlugWithId, encodeUrl, formatEventDates, formatPrice, getIdFromSlug, truncateText } from "@/lib/utils";
import EventCardGrid from "@/components/event-card-grid";
import EventCard from "@/components/event-card";
import { Route } from "next";
import Link from "next/link";
import removeMarkdown from "remove-markdown";
import LocationMapLoader from "./location-map-loader";
import Breadcrumbs from "./breadcrumbs";
import Info from "./info";
import Images from "./images";
import SectionTitle from "./section-title";
import { EventResource, Location } from "@/lib/types";
import Form from "./form";
import Tags from "./tags";
import Contacts from "./contacts";
import CalendarComponent from "./calendar";
import Description from "../../../components/description";
import InternalLinks from "@/components/seo/internal-links";
import { JsonLd } from "@/lib/seo/jsonld";
import { buildBreadcrumbJsonLd, buildEventJsonLd, buildFaqPageJsonLd } from "@/lib/seo/jsonld-builders";
import { buildMetadata } from "@/lib/seo/metadata";
import { SITE_URL } from "@/lib/seo/constants";
import { resolvePageFaq, type FaqItem } from "@/lib/seo/faq";
import FaqSection from "@/components/seo/faq";
import ApplyBar from "./apply-bar";
import GallerySection from "./gallery-section";
import { discoveryChipClass } from "@/lib/discovery-ui";

const getLocation = async (location: string): Promise<Location | null> => {
    const query = location.trim()

    if (!query) {
        return null
    }

        const url = new URL(`https://nominatim.openstreetmap.org/search`)
        url.searchParams.set('q', query)
        url.searchParams.set('limit', '1')
        url.searchParams.set('format', 'json')
        url.searchParams.set('countrycodes', 'ru')

    try {
        const response = await fetch(url.toString(), {
            method: "GET",
            headers: {
                "User-Agent": "Workevent/1.0 (+https://workevent.ru)",
                "Accept": "application/json",
                "Accept-Language": "ru",
            },
        })

        if (!response.ok) {
            console.error('Nominatim request failed:', {
                url: response.url,
                status: response.status,
                statusText: response.statusText,
            })
            return null
        }

        const data = await response.json()

        if (!Array.isArray(data) || data.length === 0) {
            return null
        }

        return data[0]
    } catch (error) {
        console.error('Error fetching location:', error)
        return null;
    }
}

type Props = {
    params: Promise<{ id: string }>
}

export const revalidate = 3600;

export async function generateStaticParams() {
    const events: Array<{ id: number; title: string }> = [];
    let page = 1;
    let lastPage = 1;

    do {
        const response = await Api.GET('/v1/events', {
            params: { query: { page, per_page: 100 } },
        });
        const data = response.data?.data ?? [];
        events.push(...data.map((event) => ({ id: event.id, title: event.title })));
        lastPage = response.data?.meta?.last_page ?? 1;
        page += 1;
    } while (page <= lastPage);

    return events.map((event) => ({
        id: createSlugWithId(event.title, event.id),
    }));
}

const getEventData = async (params: Props['params']) => {
    const resolvedParams = await params;
    const numericId = getIdFromSlug(resolvedParams.id);

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
    const slug = createSlugWithId(event.title, event.id);
    const fallbackTitle = `${event.title} — ${event.city?.title ?? ''} ${event.start_date ? new Date(event.start_date).toLocaleDateString('ru-RU', { month: 'long', day: 'numeric', year: 'numeric' }) : ''}`.trim();
    const fallbackDescription = truncateText(removeMarkdown(event.description ?? ''), 150);

    return buildMetadata(event.metadata, {
        title: fallbackTitle,
        description: fallbackDescription,
        canonicalPath: `/event/${slug}`,
        openGraph: {
            type: 'website',
            title: fallbackTitle,
            description: fallbackDescription,
            url: `${SITE_URL}/event/${slug}`,
            images: event.cover ? [{ url: event.cover }] : undefined,
        },
        twitter: {
            title: fallbackTitle,
            description: fallbackDescription,
            images: event.cover ? [event.cover] : undefined,
        },
    });
}

function buildEventFaq(event: EventResource): FaqItem[] {
    const items: FaqItem[] = [];

    if (event.start_date) {
        items.push({
            question: `Когда проходит «${event.title}»?`,
            answer: `${formatEventDates(event)}${event.city?.title ? `, ${event.city.title}` : ''}.`,
        });
    }

    if (event.format === 'webinar' || event.city || event.venue) {
        const place = event.format === 'webinar'
            ? 'Мероприятие проходит онлайн.'
            : [event.venue?.title, event.venue?.address, event.city?.title].filter(Boolean).join(', ');
        items.push({
            question: 'Где проходит мероприятие?',
            answer: place || 'Площадку уточнит организатор.',
        });
    }

    if (event.tariffs && event.tariffs.length > 0) {
        const cheapest = [...event.tariffs].sort((a, b) => a.price - b.price)[0];
        items.push({
            question: 'Сколько стоит участие?',
            answer: `Стоимость участия — от ${formatPrice(cheapest.price)}. Актуальные тарифы указаны на странице.`,
        });
    }

    items.push({
        question: 'Как принять участие?',
        answer: 'Оставьте заявку на этой странице — мы передадим её организатору. Также можно перейти на сайт организатора по кнопке «Принять участие».',
    });

    return items;
}

const prepareGeocodeQuery = (
    venue: EventResource['venue'] | undefined,
    city: string,
) => {
    const parts: string[] = [];

    if (venue?.address?.trim()) {
        parts.push(venue.address.trim());
    } else if (venue?.title?.trim()) {
        parts.push(venue.title.trim());
    }

    const cityTitle = city.trim();
    if (cityTitle && !parts.some((part) => part.toLowerCase().includes(cityTitle.toLowerCase()))) {
        parts.push(cityTitle);
    }

    return parts
        .join(', ')
        .replace(/[«»„“”"]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

export default async function EventPage({ params }: Props) {
    const { event, similarEvents, presets } = await getEventData(params);

    const preparedAddress = prepareGeocodeQuery(event.venue, event.city?.title ?? '');
    const location = await getLocation(preparedAddress);

    const code = String(
        await compile(event.description ?? '', { outputFormat: 'function-body' })
    )

    const { default: DescriptionMDX } = await run(code, {
        ...runtime,
        baseUrl: import.meta.url,
    })

    const eventUrl = `${SITE_URL}/event/${createSlugWithId(event.title, event.id)}`;
    const faq = resolvePageFaq(event.description, buildEventFaq(event));
    const faqJsonLd = buildFaqPageJsonLd(faq.items);

    return (
        <div className="flex flex-col gap-10 pb-24 min-[768px]:gap-16 min-[768px]:pb-0">
            <JsonLd
                data={[
                    buildEventJsonLd(event),
                    buildBreadcrumbJsonLd([
                        { name: 'Главная', url: SITE_URL },
                        { name: 'Мероприятия', url: `${SITE_URL}/events` },
                        { name: event.title, url: eventUrl },
                    ]),
                    ...(faqJsonLd ? [faqJsonLd] : []),
                ]}
            />

            <Breadcrumbs event={event} />

            <div className="flex flex-col items-start gap-8 min-[1024px]:flex-row min-[1024px]:gap-10">
                <div className="flex min-w-0 w-full flex-1 flex-col gap-6">
                    <Images event={event} />
                    <Info event={event} hasMap={Boolean(location)} />
                    <GallerySection event={event} />
                </div>
                <div
                    id="apply"
                    className="w-full scroll-mt-24 min-[1024px]:sticky min-[1024px]:top-24 min-[1024px]:w-[380px] min-[1024px]:shrink-0"
                >
                    <Form
                        organizerHref={
                            event.website
                                ? encodeUrl(event.website, { utm_campaign: 'apply' })
                                : undefined
                        }
                    />
                </div>
            </div>

            <div className="flex flex-col gap-8 min-[1024px]:flex-row">
                <div className="flex min-w-0 grow flex-col gap-5">
                    <SectionTitle>О мероприятии</SectionTitle>
                    <Description>
                        <DescriptionMDX
                            components={{
                                h1: (props: ComponentProps<'h2'>) => <h2 {...props} />,
                                h2: (props: ComponentProps<'h3'>) => <h3 {...props} />,
                                h3: (props: ComponentProps<'h4'>) => <h4 {...props} />,
                            }}
                        />
                    </Description>
                </div>
                <div className="flex flex-col gap-5 min-[1024px]:w-[380px] min-[1024px]:shrink-0">
                    <SectionTitle>Дата мероприятия</SectionTitle>
                    <CalendarComponent event={event} />
                </div>
            </div>

            {event.tags && event.tags.length > 0 && (
                <div className="flex flex-col gap-5">
                    <SectionTitle>Темы мероприятия</SectionTitle>
                    <Tags tags={event.tags} />
                </div>
            )}

            {(event.website || event.email || event.phone) && (
                <div className="flex flex-col gap-5">
                    <SectionTitle>Контакты организатора</SectionTitle>
                    <Contacts event={event} />
                </div>
            )}

            {location && (
                <div className="flex flex-col gap-5" id="map">
                    <SectionTitle>Местоположение</SectionTitle>
                    <LocationMapLoader location={location} event={event} />
                </div>
            )}

            {similarEvents.length > 0 && (
                <div className="flex flex-col gap-5">
                    <SectionTitle>Похожие мероприятия</SectionTitle>
                    <EventCardGrid>
                        {similarEvents.map((similar) => (
                            <EventCard key={similar.id} event={similar} />
                        ))}
                    </EventCardGrid>
                </div>
            )}

            {presets && presets.length > 0 && (
                <div className="flex flex-col gap-5">
                    <SectionTitle>Подборки</SectionTitle>
                    <div className="flex flex-wrap gap-2">
                        {presets.map((preset) => (
                            <Link
                                key={preset.id}
                                href={`/events/${preset.slug}` as Route}
                                className={discoveryChipClass}
                            >
                                {preset.title}
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {faq.visible && <FaqSection items={faq.items} />}

            <InternalLinks variant="event" event={event} />

            <ApplyBar />
        </div>
    );
}
