import Search from "@/components/search";
import Presets from "@/app/(home)/presets";
import EventsByIndustry from "@/app/(home)/events-by-industry";
import Recommendations from "@/app/(home)/recommendations";
import InternalLinks from "@/components/seo/internal-links";
import { Api } from "@/lib/api";
import { Metadata } from "next";
import H1 from "@/components/ui/h1";
import { JsonLd } from "@/lib/seo/jsonld";
import { buildCollectionPageJsonLd, buildFaqPageJsonLd } from "@/lib/seo/jsonld-builders";
import { buildMetadata } from "@/lib/seo/metadata";
import { getSeoYear, SITE_URL } from "@/lib/seo/constants";
import FaqSection from "@/components/seo/faq";

export const dynamic = 'force-dynamic';

async function getData() {
  const [eventsResponse, recommendationsResponse, industriesResponse, citiesResponse] = await Promise.all([
    Api.GET('/v1/events', {
      cache: 'no-store',
      params: {
        query: {
          per_page: 12
        }
      }
    }),
    Api.GET('/v1/events', {
      cache: 'no-store',
      params: {
        query: {
          per_page: 4,
          is_priority: 'true'
        }
      }
    }),
    Api.GET('/v1/industries', { cache: 'no-store' }),
    Api.GET('/v1/cities', { cache: 'no-store' })
  ]);
  return {
    events: eventsResponse.data?.data ?? [],
    eventsMeta: eventsResponse.data?.meta,
    recommendations: recommendationsResponse.data?.data ?? [],
    recommendationsMeta: recommendationsResponse.data?.meta,
    industries: (industriesResponse.data?.data ?? []).filter((industry) => (industry.future_events_count ?? 0) > 0),
    cities: citiesResponse.data?.data ?? []
  };
}

const EMPTY_META = { total: 0, per_page: 0, current_page: 0, last_page: 0 };

const title = 'Каталог деловых мероприятий в России: конференции, форумы, семинары';

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata(null, {
    title: 'Все бизнес‑события России: семинары, форумы, тренинги и выставки - Workevent',
    description: 'Каталог деловых мероприятий на сайте Workevent. Поиск по датам, индустриям, городам. Контакты организаторов, отзывы участников, фото и видео. Инструменты организаторов',
    canonicalPath: '/',
    openGraph: {
      type: 'website',
      title: 'Все бизнес‑события России — Workevent',
      description: 'Каталог деловых мероприятий на сайте Workevent. Поиск по датам, индустриям, городам.',
      url: SITE_URL,
    },
  });
}

export default async function Home() {
  const { industries, events, eventsMeta, recommendations, recommendationsMeta, cities } = await getData();
  const seoYear = getSeoYear();
  const faqItems = [
    {
      question: 'Что можно найти на Workevent?',
      answer: 'Каталог деловых мероприятий России: конференции, форумы, семинары и выставки с датами, городами и отраслями.',
    },
    {
      question: 'Как искать события по городу или отрасли?',
      answer: 'Откройте разделы городов и отраслей внизу страницы или воспользуйтесь поиском по датам и индустриям.',
    },
    {
      question: 'Где смотреть план на год?',
      answer: `Календарь мероприятий на ${seoYear} год собирает события по датам. Это отдельный раздел, не дубль отраслевого каталога.`,
    },
  ];
  const faqJsonLd = buildFaqPageJsonLd(faqItems);

  return (
    <div className="flex flex-col gap-12">
      <JsonLd
        data={[
          buildCollectionPageJsonLd({
            name: title,
            description: 'Каталог деловых мероприятий: конференции, форумы, семинары, выставки в России',
            url: SITE_URL,
          }),
          ...(faqJsonLd ? [faqJsonLd] : []),
        ]}
      />

      <div className="flex flex-col gap-4">
        <Search industries={industries} cities={cities} />
        <Presets />
      </div>
      {recommendations.length > 0 && <Recommendations initialEvents={recommendations} initialMeta={recommendationsMeta ?? EMPTY_META} />}
      <H1 className="m-0">{title}</H1>
      <EventsByIndustry initialIndustries={industries} initialEvents={events} initialMeta={eventsMeta ?? EMPTY_META} />
      <FaqSection items={faqItems} />
      <InternalLinks />
    </div>
  );
}
