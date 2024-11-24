import Api from "@/lib/api";
import { Suspense } from "react";
import EventsList from "@/components/events-list";
import Search from "@/components/search";
import { redirect } from "next/navigation";
import { EventFormat, EventIndexParametersQuery } from "@/lib/api/types";
import H1 from "@/components/ui/h1";
import { Metadata } from "next";

type Props = {
    params: { preset: string }
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
                per_page: 8,
                page: 1
            }
        }
    })
}


export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const preset = await getPreset(params.preset);

    return {
        title: preset?.title,
        description: preset?.title,
        // TODO: get description from API
        // TODO: use metadata from API
        // TODO: Add open graph and twitter metadata
    };
}

export default async function PresetPage({ params }: Props) {
    const preset = await getPreset(params.preset);

    if (!preset) {
        redirect('/events');
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

    const industries = await Api.GET('/v1/industries').then(res => res.data);
    const cities = await Api.GET('/v1/cities').then(res => res.data);

    return (
        <div className="flex flex-col gap-10">

            <Search
                industries={industries?.data ?? []}
                cities={cities?.data ?? []}
                initialParams={presetParams}
            />

            <H1 className="mt-0">{preset.title}</H1>

            <Suspense>
                <EventsList
                    initialEvents={initialEvents}
                    initialMeta={initialMeta}
                    params={presetParams}
                />
            </Suspense>
        </div>
    );
}
