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
import { buildMetadata } from '@/lib/seo/metadata';
import { getSeoYear, SITE_URL } from '@/lib/seo/constants';
import { Metadata } from 'next';
import Link from 'next/link';
import { Route } from 'next';
import { notFound } from 'next/navigation';
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

async function industryHasFutureEvents(industry: { id: number; future_events_count?: number }) {
  if (typeof industry.future_events_count === 'number') {
    return industry.future_events_count > 0;
  }

  const response = await Api.GET('/v1/events', {
    params: {
      query: {
        industry_id: industry.id,
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
  const industries = await Api.GET('/v1/industries/slugs').then((res) => res.data?.data ?? []);

  return industries
    .filter((industry) => industry.slug)
    .map((industry) => ({
      slug: industry.slug!,
    }));
}

async function getIndustry(slug: string) {
  const industryResponse = await Api.GET('/v1/industries/{industry}', {
    params: { path: { industry: slug } },
  });

  return industryResponse.data?.data ?? null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = (await params).slug;
  const industry = await getIndustry(slug);

  if (!industry) {
    return { title: 'Отрасль не найдена — Workevent' };
  }

  const pageResponse = await Api.GET('/v1/pages', {
    params: { query: { path: `/industry/${slug}` } },
  });
  const page = pageResponse.data?.data;

  const metadata = buildMetadata(page?.metadata, {
    title: `Мероприятия: ${industry.title} — Workevent`,
    description: `Каталог конференций, форумов и выставок по отрасли «${industry.title}». Актуальные даты и регистрация на Workevent.`,
    canonicalPath: `/industry/${slug}`,
    openGraph: {
      type: 'website',
      title: `${industry.title} — Workevent`,
      description: `Деловые мероприятия по отрасли «${industry.title}».`,
      url: `${SITE_URL}/industry/${slug}`,
    },
  });

  if (!(await industryHasFutureEvents(industry))) {
    return { ...metadata, robots: { index: false, follow: true } };
  }

  return metadata;
}

export default async function IndustryPage({ params }: Props) {
  const slug = (await params).slug;
  const industry = await getIndustry(slug);

  if (!industry) {
    notFound();
  }

  const pageResponse = await Api.GET('/v1/pages', {
    params: { query: { path: `/industry/${slug}` } },
  });
  const page = pageResponse.data?.data;
  const seoYear = getSeoYear();

  const response = await Api.GET('/v1/events', {
    params: {
      query: {
        industry_id: industry.id,
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

  const pageUrl = `${SITE_URL}/industry/${slug}`;
  const title = page?.metadata?.h1 ?? page?.title ?? `Мероприятия: ${industry.title}`;
  const Content = page?.content ? await compileMdxContent(page.content) : null;
  const faqItems = extractFaqItems(page?.content);

  return (
    <div className="flex flex-col gap-10">
      <JsonLd
        data={[
          buildBreadcrumbJsonLd([
            { name: 'Главная', url: SITE_URL },
            { name: 'Мероприятия', url: `${SITE_URL}/events` },
            { name: industry.title, url: pageUrl },
          ]),
          buildItemListJsonLd({
            name: title,
            description: `Деловые мероприятия по отрасли «${industry.title}»`,
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
            <BreadcrumbPage>{industry.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <H1 className="mt-0">{title}</H1>

      <div className="flex flex-wrap gap-2">
        <Link
          href={`/schedule/${seoYear}/${slug}` as Route}
          className="rounded-full border px-3 py-1 text-sm hover:bg-secondary"
        >
          Календарь {industry.title} на {seoYear}
        </Link>
      </div>

      {Content && (
        <div className="prose max-w-none text-sm">
          <Content />
        </div>
      )}

      <EventsList
        initialEvents={initialEvents}
        initialMeta={initialMeta}
        params={{ industry_id: industry.id }}
        perPage={12}
      />

      <InternalLinks />
    </div>
  );
}
