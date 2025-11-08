import Search from "@/components/search";
import Presets from "@/app/(home)/presets";
import EventsByIndustry from "@/app/(home)/events-by-industry";
import Recommendations from "@/app/(home)/recommendations";
import { Api } from "@/lib/api";
import { Metadata } from "next";
import H2 from "@/components/ui/h2";
import H1 from "@/components/ui/h1";

export const revalidate = false;

async function getData() {
  const [eventsResponse, recommendationsResponse, industriesResponse, citiesResponse] = await Promise.all([
    Api.GET('/v1/events', {
      params: {
        query: {
          per_page: 12
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
    industries: industriesResponse.data?.data.filter(industry => industry.future_events_count && industry.future_events_count > 0) ?? [],
    cities: citiesResponse.data?.data ?? []
  };
}

const EMPTY_META = { total: 0, per_page: 0, current_page: 0, last_page: 0 };

const title = 'Каталог деловых мероприятий в России: конференции, форумы, семинары';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `Все бизнес‑события России: семинары, форумы, тренинги и выставки - Workevent`,
    description: 'Каталог деловых мероприятий на сайте Workevent. Поиск по датам, индустриям, городам. Контакты организаторов, отзывы участников, фото и видео. Инструменты организаторов',
    keywords: 'каталог деловых мероприятий, конференции, форумы, семинары, бизнес-мероприятия, мероприятия в России',
  };
}

export default async function Home() {
  const { industries, events, eventsMeta, recommendations, recommendationsMeta, cities } = await getData();

  return (
    <div className="flex flex-col gap-12">
      <div className="flex flex-col gap-4">
        <Search industries={industries} cities={cities} />
        <Presets />
      </div>
      {recommendations.length > 0 && <Recommendations initialEvents={recommendations} initialMeta={recommendationsMeta ?? EMPTY_META} />}
      <H1 className="m-0">{title}</H1>
      <EventsByIndustry initialIndustries={industries} initialEvents={events} initialMeta={eventsMeta ?? EMPTY_META} />
    </div>
  );
}
