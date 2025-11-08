import H1 from "@/components/ui/h1";
import { Api } from "@/lib/api";
import { Metadata, ResolvingMetadata } from "next";
import { compile, run } from '@mdx-js/mdx'
import * as runtime from 'react/jsx-runtime'
import { notFound } from "next/navigation";
import Calendar from "./calendar";
import Industries from "./industries";
import Years from "./years";
import React from 'react';
import Description from "@/components/description";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"

type Props = {
    params: Promise<{
        year: string
        industry: string[]
    }>
}

const startYear = 2025

const getYears = () => {
    return Array.from({ length: new Date().getFullYear() - startYear + 3 }, (_, i) => startYear + i);
}

export const revalidate = false;

export async function generateStaticParams() {
    const years = getYears();
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

export async function generateMetadata(
    { params }: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const selectedYear = (await params).year;
    const industryParams = (await params).industry;
    const industrySlug = industryParams ? industryParams[0] : undefined;

    const page = await getPage(selectedYear, industrySlug);
    const industry = await getIndustry(industrySlug);

    const pageTitle = page ? page.metadata?.title ? page.metadata.title : page.title : 'План мероприятий на ' + selectedYear + ' год ' + (industry?.title ? `(${industry.title})` : '');
    const description = page?.metadata?.description ?? 'Календарь мероприятий на ' + selectedYear + ' год ' + (industry?.title ? 'для индустрии "' + industry.title + '" ' : '') + 'на сайте Workevent. План конференций, форумов, выставок и других мероприятий.';

    const fullTitle = pageTitle + ' — Workevent';

    return {
        title: fullTitle,
        description: description,
        openGraph: {
            type: 'website',
            title: fullTitle,
            description: description,
            url: `${process.env.NEXT_PUBLIC_SITE_URL}/schedule/${selectedYear}/${industrySlug ? industrySlug : ''}`,
        },
        twitter: {
            title: fullTitle,
            description: description,
        }
    }
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

    const years = getYears();
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

    // Compile the MDX source code to a function body
    const code = String(
        await compile(page?.content ?? '', { outputFormat: 'function-body' })
    )

    // Run the compiled code with the runtime and get the default export
    const { default: Content } = await run(code, {
        ...runtime,
        baseUrl: import.meta.url,
    })

    const title = page?.title ? page.title : 'План мероприятий на ' + selectedYear + ' год' + (industry?.title ? ` (${industry.title})` : '');

    return <div className="flex flex-col md:gap-12 gap-6">
        <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink href="/">Главная</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                    <BreadcrumbPage>{title}</BreadcrumbPage>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>

        <H1>{title}</H1>

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

        <Calendar events={events.data?.data ?? []} />

        {page?.content && <Description>
            <div className="prose max-w-none text-sm">
                <Content />
            </div>
        </Description>}


    </div>
} 