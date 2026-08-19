import { Api } from "@/lib/api";
import { Suspense } from "react";
import EventsList from "@/components/events-list";
import Search from "@/components/search";
import { EventIndexParametersQuery } from "@/lib/types";
import { Metadata } from "next";
type SearchParams = NonNullable<EventIndexParametersQuery>;
import H1 from "@/components/ui/h1";
import InternalLinks from "@/components/seo/internal-links";
import { JsonLd } from "@/lib/seo/jsonld";
import { buildItemListJsonLd } from "@/lib/seo/jsonld-builders";
import { buildFacetedEventsMetadata } from "@/lib/seo/metadata";
import { SITE_URL } from "@/lib/seo/constants";
import { cloneLandingPath } from "@/lib/seo/inventory";
import { permanentRedirect } from "next/navigation";
import { Route } from "next";

export const revalidate = 300;

async function getEvents(searchParams: SearchParams) {
    return await Api.GET('/v1/events', {
        params: {
            query: {
                query: searchParams.query,
                date_from: searchParams.date_from,
                date_to: searchParams.date_to,
                industry_id: searchParams.industry_id ? Number(searchParams.industry_id) : undefined,
                city_id: searchParams.city_id ? Number(searchParams.city_id) : undefined,
                per_page: 8,
            }
        }
    });
}

export async function generateMetadata({
    searchParams,
}: {
    searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
    const params = await searchParams;
    return buildFacetedEventsMetadata(params as Record<string, string | string[] | undefined>);
}

export default async function Events({
    searchParams
}: {
    searchParams: Promise<SearchParams>
}) {
    const initialParams = await searchParams;

    const [response, industriesResponse, citiesResponse] = await Promise.all([
        getEvents(initialParams),
        Api.GET('/v1/industries'),
        Api.GET('/v1/cities'),
    ]);

    const industries = industriesResponse.data?.data ?? [];
    const cities = citiesResponse.data?.data ?? [];

    const clone = cloneLandingPath(
        {
            format: initialParams.format,
            city_id: initialParams.city_id,
            industry_id: initialParams.industry_id,
        },
        cities,
        industries,
    );
    if (clone) {
        permanentRedirect(clone as Route);
    }

    const preset = response.data?.presets.length === 1 ? response.data.presets[0] : undefined;
    if (preset?.slug) {
        permanentRedirect((cloneLandingPath(preset.filters, cities, industries) ?? `/events/${preset.slug}`) as Route);
    }

    const initialEvents = response.data?.data ?? [];
    const initialMeta = response.data?.meta ?? {
        total: 0,
        per_page: 0,
        current_page: 0,
        last_page: 0
    };

    return (
        <div className="flex flex-col gap-10">
            <JsonLd
                data={buildItemListJsonLd({
                    name: 'Поиск мероприятий Workevent',
                    description: 'Поиск деловых мероприятий по датам, городам и отраслям',
                    url: `${SITE_URL}/events`,
                    events: initialEvents,
                })}
            />

            <Search industries={industries} cities={cities} initialParams={initialParams} />

            <H1 className="mt-0">Поиск мероприятий</H1>

            <Suspense>
                <EventsList initialEvents={initialEvents} initialMeta={initialMeta} params={initialParams} perPage={8} />
            </Suspense>

            <InternalLinks />
        </div>
    );
}
