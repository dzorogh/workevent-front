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

type Props = {
    params: Promise<{
        year: string
    }>,
    searchParams: Promise<{
        industry_id?: string
    }>
}

const getPage = async () => {
    const pageResponse = await Api.GET('/v1/pages', {
        cache: 'force-cache',
        revalidate: 300,
        params: {
            query: {
                path: '/schedule',
            }
        }
    });
    return pageResponse.data?.data ?? undefined;
}

export async function generateMetadata(
    { params, searchParams }: Props,
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

export default async function SchedulePage({ params, searchParams }: Props) {
    const selectedYear = (await params).year;
    const page = await getPage();
    const industryId = (await searchParams).industry_id;
    const startYear = 2024;
    const years = Array.from({ length: new Date().getFullYear() - startYear + 3 }, (_, i) => i + startYear);
    const industries = (await Api.GET('/v1/industries')).data?.data ?? [];
    const requestParams = {
        date_from: new Date(Number(selectedYear), 0, 1, 0, 0, 0, 0).getTime() / 1000,
        date_to: new Date(Number(selectedYear), 11, 31, 23, 59, 59).getTime() / 1000,
        per_page: 100,
        industry_id: industryId ? Number(industryId) : undefined
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

    return <div className="flex flex-col gap-6">
        <div className="flex gap-6 items-center justify-between">
            <H1 className="text-center">План мероприятий на {selectedYear} год</H1>

            <div className="flex gap-2 flex-wrap">
                {years.map((year) => (
                    <Link
                        key={year}
                        href={`/schedule/${year}`}
                        className={cn(year === Number(selectedYear) && "bg-brand text-brand-foreground", year !== Number(selectedYear) && "bg-muted text-muted-foreground", "text-3xl px-4 py-2 rounded-lg hover:bg-brand hover:text-brand-foreground transition-all duration-300")}
                    >
                        {year}
                    </Link>
                ))}
            </div>
        </div>

        <div className="flex gap-2 flex-wrap">
                <Button
                    variant={industryId === undefined ? "brand" : "muted"}
                    size="sm"
                >
                    <Link href={`/schedule/${selectedYear}` as Route}>
                        Все
                    </Link>
                </Button>

                {industries.map((industry) => (
                    <Button
                        variant={Number(industryId) === industry.id ? "brand" : "muted"}
                        size="sm"
                        key={industry.id}
                    >
                        <Link href={`/schedule/${selectedYear}?industry_id=${industry.id}` as Route}>
                            {industry.title}
                        </Link>
                    </Button>
                ))}
            </div>

        <Calendar events={events.data?.data ?? []} />

        <div className="prose max-w-none text-sm">
            <Content />
        </div>

    </div>
} 