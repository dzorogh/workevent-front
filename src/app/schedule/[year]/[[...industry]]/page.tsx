import H1 from "@/components/ui/h1";
import { Api } from "@/lib/api";
import { Metadata } from "next";
import { compile, run } from '@mdx-js/mdx'
import * as runtime from 'react/jsx-runtime'
import { notFound } from "next/navigation";
import Calendar from "./calendar";
import Industries from "./industries";
import Years from "./years";
import React from 'react';
import Description from "@/components/description";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { JsonLd } from "@/lib/seo/jsonld";
import { buildBreadcrumbJsonLd, buildFaqPageJsonLd, buildItemListJsonLd } from "@/lib/seo/jsonld-builders";
import { buildMetadata, isIndustryCatalogIntent, resolveScheduleHeading } from "@/lib/seo/metadata";
import { getScheduleYears, SITE_URL } from "@/lib/seo/constants";
import { resolvePageFaq } from "@/lib/seo/faq";
import FaqSection from "@/components/seo/faq";
import InternalLinks from "@/components/seo/internal-links";

type Props = {
    params: Promise<{
        year: string
        industry: string[]
    }>
}

export const revalidate = 1800;

export async function generateStaticParams() {
    const years = getScheduleYears();
    const industries = (await Api.GET('/v1/industries/slugs')).data?.data ?? [];
    const industrySlugs = [...industries.map((industry) => industry.slug), null];

    return years.flatMap(
        year => industrySlugs.map(
            industrySlug => (
                { year: year.toString(), industry: industrySlug ? [industrySlug] : [] }
            )
        )
    );
}

const getPage = async (year: string | undefined, industry: string | undefined) => {
    let path = ['schedule', year, industry].filter(Boolean).join('/');

    const pageResponse = await Api.GET('/v1/pages', {
        params: {
            query: {
                path: `/${path}`,
            }
        }
    });
    return pageResponse.data?.data ?? undefined;
}

const getIndustry = async (industrySlug: string | undefined) => {
    if (!industrySlug) return undefined;

    const industryResponse = await Api.GET('/v1/industries/{industry}', {
        params: { path: { industry: industrySlug } }
    });

    return industryResponse.data?.data ?? undefined;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const selectedYear = (await params).year;
    const industryParams = (await params).industry;
    const industrySlug = industryParams ? industryParams[0] : undefined;

    const page = await getPage(selectedYear, industrySlug);
    const industry = await getIndustry(industrySlug);

    const pageTitle = resolveScheduleHeading(selectedYear, industry?.title, page?.metadata?.title ?? page?.title);
    const description = page?.metadata?.description && !isIndustryCatalogIntent(page.metadata.description)
        ? page.metadata.description
        : industry?.title
            ? `Расписание выставок и план мероприятий отрасли «${industry.title}» на ${selectedYear} год — календарь по датам, не полный каталог отрасли.`
            : `Календарь мероприятий ${selectedYear}: расписание выставок, даты конференций и форумов. План на год, не отраслевой каталог.`;
    const canonicalPath = `/schedule/${selectedYear}${industrySlug ? `/${industrySlug}` : ''}`;

    return buildMetadata(
        page?.metadata ? { ...page.metadata, title: `${pageTitle} — Workevent`, description } : null,
        {
            title: `${pageTitle} — Workevent`,
            description,
            canonicalPath,
            openGraph: {
                type: 'website',
                title: `${pageTitle} — Workevent`,
                description,
                url: `${SITE_URL}${canonicalPath}`,
            },
        },
    );
}

export default async function SchedulePage({ params }: Props) {
    const selectedYear = (await params).year;
    const industryParams = (await params).industry;
    const industrySlug = industryParams ? industryParams[0] : undefined;

    const industry = await getIndustry(industrySlug);

    if (!industry && industrySlug) {
        notFound();
    }

    const page = await getPage(selectedYear, industrySlug);

    const years = getScheduleYears();
    const industries = (await Api.GET('/v1/industries')).data?.data ?? [];
    const requestParams = {
        date_from: new Date(Number(selectedYear), 0, 1, 0, 0, 0, 0).getTime() / 1000,
        date_to: new Date(Number(selectedYear), 11, 31, 23, 59, 59).getTime() / 1000,
        per_page: 100,
        industry_id: industry?.id ?? undefined,
    }

    const events = await Api.GET('/v1/events', {
        params: {
            query: {
                ...requestParams,
            }
        }
    });

    const code = String(
        await compile(page?.content ?? '', { outputFormat: 'function-body' })
    )

    const { default: Content } = await run(code, {
        ...runtime,
        baseUrl: import.meta.url,
    })

    const title = resolveScheduleHeading(selectedYear, industry?.title, page?.metadata?.h1 ?? page?.title);
    const canonicalPath = `/schedule/${selectedYear}${industrySlug ? `/${industrySlug}` : ''}`;
    const pageUrl = `${SITE_URL}${canonicalPath}`;
    const scheduleEvents = events.data?.data ?? [];
    const faq = resolvePageFaq(page?.content, [
        {
            question: 'Чем календарь отличается от каталога отрасли?',
            answer: industry?.title
                ? `Эта страница — план мероприятий «${industry.title}» на ${selectedYear} год. Полный каталог отрасли без привязки к году — на странице отрасли.`
                : `Календарь показывает план мероприятий на ${selectedYear} год. Каталог отрасли собирает актуальные события без привязки к году.`,
        },
        {
            question: 'Как выбрать другой год или отрасль?',
            answer: 'Воспользуйтесь фильтрами года и отрасли на этой странице.',
        },
    ]);
    const faqJsonLd = buildFaqPageJsonLd(faq.items);

    return <div className="flex flex-col md:gap-12 gap-6">
        <JsonLd
            data={[
                buildBreadcrumbJsonLd([
                    { name: 'Главная', url: SITE_URL },
                    { name: `Календарь ${selectedYear}`, url: `${SITE_URL}/schedule/${selectedYear}` },
                    ...(industry ? [{ name: title, url: pageUrl }] : []),
                ]),
                buildItemListJsonLd({
                    name: title,
                    description: industry
                        ? `Календарь мероприятий: ${industry.title} на ${selectedYear} год`
                        : `Календарь мероприятий ${selectedYear}: расписание выставок`,
                    url: pageUrl,
                    events: scheduleEvents,
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
                {industry ? (
                    <>
                        <BreadcrumbItem>
                            <BreadcrumbLink href={`/schedule/${selectedYear}`}>Календарь {selectedYear}</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>{title}</BreadcrumbPage>
                        </BreadcrumbItem>
                    </>
                ) : (
                    <BreadcrumbItem>
                        <BreadcrumbPage>{title}</BreadcrumbPage>
                    </BreadcrumbItem>
                )}
            </BreadcrumbList>
        </Breadcrumb>

        <H1>{title}</H1>

        <InternalLinks
            variant="related"
            links={[
                ...(industry?.slug
                    ? [{ href: `/industry/${industry.slug}`, label: `Все мероприятия: ${industry.title}` }]
                    : []),
                { href: '/events', label: 'Каталог мероприятий' },
            ]}
        />

        <div className="flex flex-col md:flex-row gap-6">

            <div className="flex flex-col gap-2">
                <div className="font-bold">
                    Год
                </div>

                <Years years={years} selectedYear={selectedYear} />

            </div>

            <div className="flex flex-col gap-2">
                <div className="font-bold">
                    Отрасль
                </div>

                <Industries industries={industries} industrySlug={industrySlug} homeRoute={`/schedule/${selectedYear}`} />

            </div>

        </div>

        <Calendar events={scheduleEvents} />

        {page?.content && <Description>
            <div className="prose max-w-none text-sm">
                <Content />
            </div>
        </Description>}

        {faq.visible && <FaqSection items={faq.items} />}
    </div>
}
