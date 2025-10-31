import Search from "@/components/search";
import Presets from "@/app/presets";
import EventsByIndustry from "@/app/events-by-industry";
import Recommendations from "@/app/recommendations";
import { Api } from "@/lib/api";
import { Metadata } from "next";

export const revalidate = false;

async function getData() {
  const [eventsResponse, recommendationsResponse, industriesResponse, citiesResponse] = await Promise.all([
    Api.GET('/v1/events', {
      params: {
        query: {
          per_page: 4
        }
      }
    }),
    Api.GET('/v1/events', {
      params: {
        query: {
          per_page: 4,
          is_priority: 'true'
        }
      }
    }),
    Api.GET('/v1/industries'),
    Api.GET('/v1/cities')
  ]);
  return {
    events: eventsResponse.data?.data ?? [],
    eventsMeta: eventsResponse.data?.meta,
    recommendations: recommendationsResponse.data?.data ?? [],
    recommendationsMeta: recommendationsResponse.data?.meta,
    industries: industriesResponse.data?.data ?? [],
    cities: citiesResponse.data?.data ?? []
  };
}

const EMPTY_META = { total: 0, per_page: 0, current_page: 0, last_page: 0 };

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Workevent — каталог деловых мероприятий',
    description: 'Каталог деловых мероприятий на сайте Workevent. Поиск по датам, индустриям, городам. Контакты организаторов, отзывы участников, фото и видео. Инструменты организаторов',
  };
}

export default async function Home() {
  const { industries, events, eventsMeta, recommendations, recommendationsMeta, cities } = await getData();

  return (
    <div className="flex flex-col gap-10 md:gap-20">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-lg font-semibold mb-2">Поиск мероприятий</h1>
          <Search industries={industries} cities={cities} />
        </div>
        <Presets />
      </div>
      {recommendations.length > 0 && <Recommendations initialEvents={recommendations} initialMeta={recommendationsMeta ?? EMPTY_META} />}
      <EventsByIndustry initialIndustries={industries} initialEvents={events} initialMeta={eventsMeta ?? EMPTY_META} />
    </div>
  );
}
