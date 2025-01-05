import H1 from "@/components/ui/h1";
import Api from "@/lib/api";
import { Metadata, ResolvingMetadata } from "next";
import { compile, run } from '@mdx-js/mdx'
import * as runtime from 'react/jsx-runtime'
import { notFound } from "next/navigation";
import Calendar from "./calendar";
import Industries from "./industries";
import Years from "./years";
import React from 'react';

type Props = {
    params: Promise<{
        year: string
        industry: string[]
    }>
}


const getYears = () => {
    const currentYear = new Date().getFullYear();
    return [currentYear - 1, currentYear, currentYear + 1];
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

    const pageTitle = page ? page.metadata?.title ? page.metadata.title : page.title : 'Расписание (план) мероприятий на ' + selectedYear + ' год ' + (industry?.title ? `(${industry.title})` : '');

    const fullTitle = pageTitle + ' — ' + (await parent).title?.absolute;


    return {
        title: fullTitle,
        description: page?.metadata?.description
    }
}

// Wrap the Years and Industries components with React.memo
const MemoizedYears = React.memo(Years);
const MemoizedIndustries = React.memo(Industries);

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

    return <div className="flex flex-col md:gap-12 gap-6">

        <div className="bg-muted rounded-b-3xl rounded-t-lg flex flex-col overflow-hidden">
            <Years years={years} selectedYear={selectedYear} />

            <Industries industries={industries} industrySlug={industrySlug} homeRoute={`/schedule/${selectedYear}`} />
        </div>

        <H1 className="m-0 text-center">{page?.title ? page.title : 'План мероприятий на ' + selectedYear + ' год' + (industry?.title ? ` (${industry.title})` : '')}</H1>

        <Calendar events={events.data?.data ?? []} />

        <div className="prose max-w-none text-sm">
            <Content />
        </div>

    </div>
} 