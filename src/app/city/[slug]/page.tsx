import { compileMdxContent } from '@/lib/seo/mdx-content';
import { Api } from '@/lib/api';
import EventsList from '@/components/events-list';
import H1 from '@/components/ui/h1';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import InternalLinks from '@/components/seo/internal-links';
import { JsonLd } from '@/lib/seo/jsonld';
import { buildBreadcrumbJsonLd, buildItemListJsonLd } from '@/lib/seo/jsonld-builders';
import { buildMetadata, isBrokenCityPrep, resolveCityCopy, resolveCityVisibleHeading } from '@/lib/seo/metadata';
import { SITE_URL } from '@/lib/seo/constants';
import { createSlugWithId, getIdFromSlug } from '@/lib/utils';
import { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import type { FAQPage, WithContext } from 'schema-dts';

function extractFaqItems(content: string | null | undefined) {
  if (!content) return [];

  const section = content.split(/## FAQ(?:[^\n]*)\n/)[1];
  if (!section) return [];

  const items: Array<{ name: string; text: string }> = [];
  const pattern = /\*\*(.+?)\*\*\s*\n+([\s\S]*?)(?=\n\*\*|$)/g;

  for (const match of section.matchAll(pattern)) {
    const name = match[1]?.trim();
    const text = match[2]?.trim();
    if (name && text) {
      items.push({ name, text });
    }
  }

  return items;
}

function buildLocalFaqJsonLd(items: Array<{ name: string; text: string }>): WithContext<FAQPage> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.name,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.text,
      },
    })),
  };
}

async function cityHasFutureEvents(city: { id: number; events_count?: number }) {
  if (city.events_count === 0) {
    return false;
  }

  const response = await Api.GET('/v1/events', {
    params: {
      query: {
        city_id: city.id,
        date_from: Math.floor(Date.now() / 1000),
        per_page: 1,
        page: 1,
      },
    },
  });

  return (response.data?.meta?.total ?? response.data?.data?.length ?? 0) > 0;
}

type Props = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 3600;

export async function generateStaticParams() {
  const cities = await Api.GET('/v1/cities').then((res) => res.data?.data ?? []);

  return cities.map((city) => ({
    slug: createSlugWithId(city.title, city.id),
  }));
}

async function getCity(slug: string) {
  const cityId = Number(getIdFromSlug(slug));
  const cities = await Api.GET('/v1/cities').then((res) => res.data?.data ?? []);
  const city = cities.find((item) => item.id === cityId);

  if (!city) {
    return null;
  }

  const correctSlug = createSlugWithId(city.title, city.id);
  if (slug !== correctSlug) {
    permanentRedirect(`/city/${correctSlug}`);
  }

  return city;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const city = await getCity((await params).slug);

  if (!city) {
    return { title: 'Город не найден — Workevent' };
  }

  const pageResponse = await Api.GET('/v1/pages', {
    params: { query: { path: `/city/${createSlugWithId(city.title, city.id)}` } },
  });
  const page = pageResponse.data?.data;
  const citySlug = createSlugWithId(city.title, city.id);
  const copy = resolveCityCopy(city, citySlug);
  const visibleTitle = resolveCityVisibleHeading(city, citySlug, page?.metadata?.title, 'title');
  const visibleDescription = isBrokenCityPrep(page?.metadata?.description, city.title)
    ? copy.description
    : page?.metadata?.description;

  const metadata = buildMetadata(
    page?.metadata ? { ...page.metadata, title: visibleTitle, description: visibleDescription ?? copy.description } : null,
    {
      title: copy.title,
      description: copy.description,
      canonicalPath: `/city/${citySlug}`,
      openGraph: {
        type: 'website',
        title: copy.ogTitle,
        description: copy.ogDescription,
        url: `${SITE_URL}/city/${citySlug}`,
      },
    },
  );

  if (!(await cityHasFutureEvents(city))) {
    return { ...metadata, robots: { index: false, follow: true } };
  }

  return metadata;
}

export default async function CityPage({ params }: Props) {
  const city = await getCity((await params).slug);

  if (!city) {
    notFound();
  }

  const pageResponse = await Api.GET('/v1/pages', {
    params: { query: { path: `/city/${createSlugWithId(city.title, city.id)}` } },
  });
  const page = pageResponse.data?.data;

  const response = await Api.GET('/v1/events', {
    params: {
      query: {
        city_id: city.id,
        per_page: 12,
        page: 1,
      },
    },
  });

  const initialEvents = response.data?.data ?? [];
  const initialMeta = response.data?.meta ?? {
    total: 0,
    per_page: 0,
    current_page: 0,
    last_page: 0,
  };

  const citySlug = createSlugWithId(city.title, city.id);
  const pageUrl = `${SITE_URL}/city/${citySlug}`;
  const copy = resolveCityCopy(city, citySlug);
  const title = resolveCityVisibleHeading(city, citySlug, page?.metadata?.h1 ?? page?.title, 'h1');
  const Content = page?.content ? await compileMdxContent(page.content) : null;
  const faqItems = extractFaqItems(page?.content);

  return (
    <div className="flex flex-col gap-10">
      <JsonLd
        data={[
          buildBreadcrumbJsonLd([
            { name: 'Главная', url: SITE_URL },
            { name: 'Мероприятия', url: `${SITE_URL}/events` },
            { name: city.title, url: pageUrl },
          ]),
          buildItemListJsonLd({
            name: title,
            description: copy.listDescription,
            url: pageUrl,
            events: initialEvents,
          }),
          ...(faqItems.length > 0 ? [buildLocalFaqJsonLd(faqItems)] : []),
        ]}
      />

      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Главная</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/events">Мероприятия</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{city.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <H1 className="mt-0">{title}</H1>

      {Content && (
        <div className="prose max-w-none text-sm">
          <Content />
        </div>
      )}

      <EventsList
        initialEvents={initialEvents}
        initialMeta={initialMeta}
        params={{ city_id: city.id }}
        perPage={12}
      />

      <InternalLinks />
    </div>
  );
}
