import Api from "@/lib/api";
import { Suspense } from "react";
import EventsList from "./events-list";
import { operations } from "@/lib/api/v1";
import Search from "@/components/search";

type SearchParams = NonNullable<operations["event.index"]["parameters"]["query"]>;

async function getEvents(searchParams: SearchParams) {
    const response = await Api.GET('/v1/events', {
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
    return response;
}

export default async function Events({
    searchParams
}: {
    searchParams: Promise<SearchParams>
}) {
    const initialParams = await searchParams;

    const response = await getEvents(initialParams);
    const initialEvents = response.data?.data ?? [];
    const initialMeta = response.data?.meta ?? {
        total: 0,
        per_page: 0,
        current_page: 0,
        last_page: 0
    };
    
    const industries = await Api.GET('/v1/industries').then(res => res.data);
    const cities = await Api.GET('/v1/cities').then(res => res.data);


    return (
        <div className="flex flex-col gap-10">
            <Search industries={industries?.data ?? []} cities={cities?.data ?? []} initialParams={initialParams} />
            
            <Suspense>
                <EventsList initialEvents={initialEvents} initialMeta={initialMeta} params={initialParams} />
            </Suspense>
        </div>
    );
}
