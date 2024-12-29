import H1 from "@/components/ui/h1";
import Api from "@/lib/api";
import { Metadata, ResolvingMetadata } from "next";
import { compile, run } from '@mdx-js/mdx'
import * as runtime from 'react/jsx-runtime'
import Calendar from "./calendar";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Route } from "next";
import { notFound } from "next/navigation";


type Props = {
    params: Promise<{
        year: string
        industry: string
    }>
}

const startYear = 2024;

const getYears = (startYear: number) => {
    return Array.from({ length: new Date().getFullYear() - startYear + 3 }, (_, i) => i + startYear);
}

export async function generateStaticParams() {
    const years = getYears(startYear);
    const industries = (await Api.GET('/v1/industries/slugs')).data?.data ?? [];
    const industrySlugs = industries.map((industry) => industry.slug);

    return years.flatMap((year) => industrySlugs.map((industrySlug) => ({ year: year.toString(), industry: [industrySlug] })));
}

const getPage = async () => {
    const pageResponse = await Api.GET('/v1/pages', {
        cache: 'force-cache',
        params: {
            query: {
                path: '/schedule',
            }
        }
    });
    return pageResponse.data?.data ?? undefined;
}

export async function generateMetadata(
    { params }: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const year = (await params).year;
    const page = await getPage();
    const title = 'Расписание (план) мероприятий на ' + year + ' год' + ' — ' + (await parent).title?.absolute;

    return {
        title: title,
        description: page?.metadata?.description
    }
}

export default async function SchedulePage({ params }: Props) {
    const selectedYear = (await params).year;
    const industryParams = (await params).industry;
    const industrySlug = industryParams ? industryParams[0] : undefined;

    const industry = industrySlug ? (await Api.GET('/v1/industries/{industry}', {
        params: {
            path: {
                industry: industrySlug
            }
        }
    })).data?.data : undefined;

    if (!industry && industrySlug) {
        notFound();
    }

    const page = await getPage();
    const years = getYears(startYear);
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
        <div className="flex gap-2 flex-wrap items-center justify-center">
            {years.map((year) => (
                <Link
                    key={year}
                    href={`/schedule/${year}` as Route}
                    className={cn(year === Number(selectedYear) && "bg-brand text-brand-foreground", year !== Number(selectedYear) && "bg-muted text-muted-foreground", "text-3xl px-4 py-2 rounded-lg hover:bg-brand hover:text-brand-foreground transition-all duration-300")}
                >
                    {year}
                </Link>
            ))}
        </div>

        
        <div className="flex gap-2 flex-wrap items-center justify-center">
            <Button
                variant={industrySlug === undefined ? "brand" : "muted"}
                size="sm"
                asChild
            >
                <Link href={`/schedule/${selectedYear}` as Route}>
                    Все
                </Link>
            </Button>

            {industries.map((industry: any) => (
                <Button
                    variant={industry.slug === industrySlug ? "brand" : "muted"}
                    size="sm"
                    key={industry.id}
                    asChild
                >
                    <Link href={`/schedule/${selectedYear}/${industry.slug}` as Route}>
                        {industry.title}
                    </Link>
                </Button>
            ))}
        </div>

        <H1 className="m-0 text-center">План мероприятий на {selectedYear} год {industry?.title ? `(${industry.title})` : ''}</H1>

        <Calendar events={events.data?.data ?? []} />

        <div className="prose max-w-none text-sm">
            <Content />
        </div>

    </div>
} 