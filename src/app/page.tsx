import SearchClientWrapper from "@/components/search-client-wrapper";
import Presets from "@/components/presets";
import EventsByIndustry from "@/components/events-by-industry";
import SubscribeClientWrapper from "@/components/subscribe-client-wrapper";
import Recommendations from "@/components/recommendations";
import { api } from "@/lib/api";

async function getData() {
  const [industriesResponse, eventsResponse, recommendationsResponse] = await Promise.all([
    api.fetchClient.GET('/v1/industries',
      {
        cache: 'force-cache',
        revalidate: false,
      }
    ),
    api.fetchClient.GET('/v1/events', {
      cache: 'force-cache',
      revalidate: false,
      params: {
        query: {
          per_page: 4
        }
      }
    }),
    api.fetchClient.GET('/v1/events', {
      cache: 'force-cache',
      revalidate: false,
      params: {
        query: {
          per_page: 4,
          is_priority: 1
        }
      }
    })
  ]);
  return {
    industries: industriesResponse.data?.data ?? [],
    eventsByIndustry: eventsResponse.data?.data ?? [],
    eventsByIndustryMeta: eventsResponse.data?.meta,
    recommendations: recommendationsResponse.data?.data ?? [],
    recommendationsMeta: recommendationsResponse.data?.meta
  };
}

export default async function Home() {
  const { industries, eventsByIndustry, eventsByIndustryMeta, recommendations, recommendationsMeta } = await getData();

  return (
    <div className="my-20 flex flex-col gap-20">
      <div className="flex flex-col gap-6">
        <SearchClientWrapper />
        <Presets />
      </div>
      <Recommendations initialEvents={recommendations} initialMeta={recommendationsMeta ?? {total: '0', per_page: '0', current_page: '0', last_page: '0'}} />
      <EventsByIndustry initialIndustries={industries} initialEvents={eventsByIndustry} initialMeta={eventsByIndustryMeta ?? {total: '0', per_page: '0', current_page: '0', last_page: '0'}} />
      <SubscribeClientWrapper />
    </div>
  );
}
