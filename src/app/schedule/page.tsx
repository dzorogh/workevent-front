import H1 from "@/components/ui/h1";
import Api from "@/lib/api";
import { Metadata, ResolvingMetadata } from "next";
import { compile, run } from '@mdx-js/mdx'
import * as runtime from 'react/jsx-runtime'
import Calendar from "./calendar";

type Props = {
    params: undefined
    searchParams: undefined
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
    const page = await getPage();

    const title = page?.metadata?.title + ' — ' + (await parent).title?.absolute;

    return {
        title: title,
        description: page?.metadata?.description
    }
}

export default async function SchedulePage() {
    const page = await getPage();

    // Compile the MDX source code to a function body
    const code = String(
        await compile(page?.content ?? '', { outputFormat: 'function-body' })
    )

    // Run the compiled code with the runtime and get the default export
    const { default: Content } = await run(code, {
        ...runtime,
        baseUrl: import.meta.url,
    })

    const industries = await Api.GET('/v1/industries');
    const params = {
        date_from: new Date(2025, 0, 1, 0, 0, 0, 0).getTime() / 1000,
        date_to: new Date(2025, 11, 31, 23, 59, 59).getTime() / 1000,
        per_page: 100
    }
    const events = await Api.GET('/v1/events', {
        params: {
            query: {
                ...params,
            }
        }
    });

    return <div className="flex flex-col gap-6">
        <H1>Расписание мероприятий на 2025 год</H1>
        <Calendar industries={industries.data?.data ?? []} initialEvents={events.data?.data ?? []} params={params} />
        <div className="prose max-w-none text-sm">
            <Content />
        </div>

    </div>
} 