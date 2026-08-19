import { Api } from "@/lib/api";
import { Suspense } from "react";
import EventsList from "@/components/events-list";
import Search from "@/components/search";
import { permanentRedirect } from "next/navigation";
import { compile, run } from '@mdx-js/mdx'
import * as runtime from 'react/jsx-runtime'
import { EventFormat, EventIndexParametersQuery } from "@/lib/types";
import H1 from "@/components/ui/h1";
import { Metadata } from "next";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { JsonLd } from "@/lib/seo/jsonld";
import { buildBreadcrumbJsonLd, buildFaqPageJsonLd, buildItemListJsonLd } from "@/lib/seo/jsonld-builders";
import { buildMetadata, isIndustryCatalogIntent, resolvePresetHeading } from "@/lib/seo/metadata";
import { getSeoYear, SITE_URL } from "@/lib/seo/constants";
import { cloneLandingPath } from "@/lib/seo/inventory";
import { resolvePageFaq } from "@/lib/seo/faq";
import FaqSection from "@/components/seo/faq";
import InternalLinks from "@/components/seo/internal-links";
import { createSlugWithId } from "@/lib/utils";

type Props = {
    params: Promise<{ preset: string }>
}

export const revalidate = 3600;

export async function generateStaticParams() {
    const presets = await Api.GET('/v1/presets/slugs')
        .then(res => res.data?.data || []);

    return presets.map((preset) => ({
        preset: preset.slug,
    }))
}

async function getPreset(slug: string) {
    const preset = await Api.GET(`/v1/presets/{preset}`, {
        params: { path: { preset: slug } }
    }).then(res => res.data?.data);

    return preset;
}

async function getEvents(presetParams: EventIndexParametersQuery) {
    return await Api.GET('/v1/events', {
        params: {
            query: {
                ...presetParams,
                per_page: 12,
                page: 1
            }
        }
    })
}


export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const preset = await getPreset((await params).preset);

    if (!preset) {
        return { title: 'Подборка не найдена — Workevent' };
    }

    const [industriesResponse, citiesResponse] = await Promise.all([
        Api.GET('/v1/industries'),
        Api.GET('/v1/cities'),
    ]);
    const clone = cloneLandingPath(
        preset.filters,
        citiesResponse.data?.data ?? [],
        industriesResponse.data?.data ?? [],
    );
    if (clone) {
        permanentRedirect(clone);
    }

    const title = resolvePresetHeading(preset.title, preset.metadata?.title);
    const description = preset.metadata?.description && !isIndustryCatalogIntent(preset.metadata.description)
        ? preset.metadata.description
        : `Редакционная подборка «${preset.title}» на Workevent: отобранные мероприятия, а не полный каталог отрасли.`;

    return buildMetadata(
        preset.metadata ? { ...preset.metadata, title: `${title} — Workevent`, description } : null,
        {
            title: `${title} — Workevent`,
            description,
            canonicalPath: `/events/${preset.slug}`,
            openGraph: {
                type: 'website',
                title: `${title} — Workevent`,
                description,
                url: `${SITE_URL}/events/${preset.slug}`,
            },
        },
    );
}

export default async function PresetPage({ params }: Props) {
    const preset = await getPreset((await params).preset);

    if (!preset) {
        permanentRedirect('/events');
    }

    const [industriesResponse, citiesResponse] = await Promise.all([
        Api.GET('/v1/industries'),
        Api.GET('/v1/cities'),
    ]);
    const industriesList = industriesResponse.data?.data ?? [];
    const citiesList = citiesResponse.data?.data ?? [];
    const clone = cloneLandingPath(preset.filters, citiesList, industriesList);
    if (clone) {
        permanentRedirect(clone);
    }

    const presetParams = {
        format: preset.filters.format as EventFormat,
        city_id: preset.filters.city_id ? Number(preset.filters.city_id) : undefined,
        industry_id: preset.filters.industry_id ? Number(preset.filters.industry_id) : undefined
    };

    const response = await getEvents(presetParams);
    const initialEvents = response.data?.data ?? [];
    const initialMeta = response.data?.meta ?? {
        total: 0,
        per_page: 0,
        current_page: 0,
        last_page: 0
    };

    const industries = { data: industriesList };
    const cities = { data: citiesList };

    const code = String(
        await compile(preset.description ?? '', { outputFormat: 'function-body' })
    )

    const { default: Description } = await run(code, {
        ...runtime,
        baseUrl: import.meta.url,
    })

    const pageUrl = `${SITE_URL}/events/${preset.slug}`;
    const h1 = resolvePresetHeading(preset.title, preset.metadata?.h1 ?? preset.title);
    const seoYear = getSeoYear();
    const industry = industries?.data?.find((item) => item.id === Number(preset.filters.industry_id));
    const city = cities?.data?.find((item) => item.id === Number(preset.filters.city_id));
    const faq = resolvePageFaq(preset.description, [
        {
            question: 'Чем эта подборка отличается от страницы отрасли?',
            answer: `Это редакционная подборка «${preset.title}» с заданными фильтрами, а не полный каталог отрасли. Полный список смотрите на странице отрасли.`,
        },
        {
            question: 'Как посмотреть план мероприятий на год?',
            answer: `Откройте календарь на ${seoYear} год — там события разложены по датам, это другой тип страницы.`,
        },
    ]);
    const faqJsonLd = buildFaqPageJsonLd(faq.items);

    return (
        <div className="flex flex-col gap-10">
            <JsonLd
                data={[
                    buildBreadcrumbJsonLd([
                        { name: 'Главная', url: SITE_URL },
                        { name: 'Мероприятия', url: `${SITE_URL}/events` },
                        { name: h1, url: pageUrl },
                    ]),
                    buildItemListJsonLd({
                        name: h1,
                        description: `Редакционная подборка «${preset.title}»`,
                        url: pageUrl,
                        events: initialEvents,
                    }),
                    ...(faqJsonLd ? [faqJsonLd] : []),
                ]}
            />

            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/">Главная</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/events">Мероприятия</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>{h1}</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <Search
                industries={industries?.data ?? []}
                cities={cities?.data ?? []}
                initialParams={presetParams}
            />

            <H1 className="mt-0">{h1}</H1>

            <InternalLinks
                variant="related"
                links={[
                    ...(industry?.slug
                        ? [{ href: `/industry/${industry.slug}`, label: `Все мероприятия: ${industry.title}` }]
                        : []),
                    ...(city
                        ? [{ href: `/city/${createSlugWithId(city.title, city.id)}`, label: `Мероприятия в ${city.title}` }]
                        : []),
                    {
                        href: `/schedule/${seoYear}${industry?.slug ? `/${industry.slug}` : ''}`,
                        label: `Календарь на ${seoYear}`,
                    },
                ]}
            />

            <Suspense>
                <EventsList
                    initialEvents={initialEvents}
                    initialMeta={initialMeta}
                    params={presetParams}
                    perPage={8}
                />
            </Suspense>

            <div className="prose max-w-none">
                <Description />
            </div>

            {faq.visible && <FaqSection items={faq.items} />}
        </div>
    );
}
