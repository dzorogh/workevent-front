import type { Metadata } from 'next';
import type { components } from '@/lib/api/v1';
import { SITE_NAME, SITE_URL } from './constants';

type MetadataResource = components['schemas']['MetadataResource'];

export type MetadataFallback = {
  title: string;
  description?: string;
  keywords?: string | string[];
  canonicalPath?: string;
  openGraph?: {
    type?: 'website' | 'article';
    title?: string;
    description?: string;
    url?: string;
    images?: NonNullable<Metadata['openGraph']> extends { images?: infer I } ? I : never;
  };
  twitter?: Metadata['twitter'];
  robots?: Metadata['robots'];
};

function parseRobots(robots: string | null | undefined): Metadata['robots'] | undefined {
  if (!robots) return undefined;

  const normalized = robots.toLowerCase();
  const index = normalized.includes('noindex') ? false : true;
  const follow = normalized.includes('nofollow') ? false : true;

  return { index, follow };
}

function resolveCanonical(
  metadata: MetadataResource | null | undefined,
  fallbackPath?: string,
): string | undefined {
  if (metadata?.canonicalUrl) {
    return metadata.canonicalUrl;
  }

  if (fallbackPath) {
    return fallbackPath.startsWith('http')
      ? fallbackPath
      : `${SITE_URL}${fallbackPath.startsWith('/') ? fallbackPath : `/${fallbackPath}`}`;
  }

  return undefined;
}

export function buildMetadata(
  metadata: MetadataResource | null | undefined,
  fallback: MetadataFallback,
): Metadata {
  const title = metadata?.title ?? fallback.title;
  const description = metadata?.description ?? fallback.description;
  const canonical = resolveCanonical(metadata, fallback.canonicalPath);

  const openGraphTitle = metadata?.openGraph?.title ?? fallback.openGraph?.title ?? title;
  const openGraphDescription =
    metadata?.openGraph?.description ?? fallback.openGraph?.description ?? description;

  const openGraphImages = metadata?.openGraph?.image
    ? [{ url: metadata.openGraph.image }]
    : fallback.openGraph?.images;

  const twitterImages = metadata?.twitter?.image
    ? [metadata.twitter.image]
    : fallback.twitter?.images;

  return {
    title,
    description,
    keywords: metadata?.keywords ?? fallback.keywords,
    alternates: canonical ? { canonical } : undefined,
    robots: parseRobots(metadata?.robots) ?? fallback.robots,
    openGraph: {
      type: (metadata?.openGraph?.type ?? fallback.openGraph?.type ?? 'website') as 'website' | 'article',
      title: openGraphTitle ?? undefined,
      description: openGraphDescription ?? undefined,
      url: metadata?.openGraph?.url ?? canonical ?? fallback.openGraph?.url,
      siteName: metadata?.openGraph?.siteName ?? SITE_NAME,
      locale: metadata?.openGraph?.locale ?? 'ru_RU',
      images: openGraphImages,
    },
    twitter: {
      card: (metadata?.twitter?.card as 'summary' | 'summary_large_image' | undefined) ?? 'summary_large_image',
      title: metadata?.twitter?.title ?? fallback.twitter?.title ?? title,
      description: metadata?.twitter?.description ?? fallback.twitter?.description ?? description,
      site: metadata?.twitter?.site ?? undefined,
      creator: metadata?.twitter?.creator ?? undefined,
      images: twitterImages,
    },
  };
}

export function isIndustryCatalogIntent(text: string | null | undefined): boolean {
  if (!text) return false;
  const value = text.trim();
  return /^мероприятия[:\s—-]/i.test(value) && !/(подборк|календар|план на \d{4})/i.test(value);
}

export function resolvePresetHeading(presetTitle: string, raw?: string | null): string {
  const value = raw?.trim() || presetTitle;
  if (isIndustryCatalogIntent(value)) return `Подборка: ${presetTitle}`;
  if (/подборк/i.test(value)) return value;
  return `Подборка: ${value}`;
}

export function resolveScheduleHeading(
  year: string,
  industryTitle?: string,
  raw?: string | null,
): string {
  const fallback = industryTitle
    ? `Календарь мероприятий: ${industryTitle} на ${year} год`
    : `Календарь деловых мероприятий на ${year} год`;
  if (!raw?.trim()) return fallback;
  if (isIndustryCatalogIntent(raw)) return fallback;
  return raw.trim();
}

export function buildFacetedEventsMetadata(searchParams: Record<string, string | string[] | undefined>): Metadata {
  const hasFacets = Object.keys(searchParams).some((key) => {
    const value = searchParams[key];
    if (value === undefined || value === '') return false;
    return true;
  });

  return buildMetadata(null, {
    title: 'Каталог и поиск мероприятий — Workevent',
    description:
      'Мероприятия на сайте Workevent. Поиск по датам и индустриям. Конференции, форумы, выставки, семинары, тренинги, мастер-классы, лекции, круглые столы, встречи, презентации, концерты, шоу, фестивали, спортивные и развлекательные мероприятия',
    canonicalPath: '/events',
    openGraph: {
      type: 'website',
      title: 'Каталог мероприятий — Workevent',
      description:
        'Мероприятия на сайте Workevent. Поиск по датам и индустриям. Конференции, форумы, выставки, семинары, тренинги, мастер-классы, лекции, круглые столы, встречи, презентации, концерты, шоу, фестивали, спортивные и развлекательные мероприятия',
      url: `${SITE_URL}/events`,
    },
    twitter: {
      title: 'Каталог мероприятий — Workevent',
      description:
        'Мероприятия на сайте Workevent. Поиск по датам и индустриям. Конференции, форумы, выставки, семинары, тренинги, мастер-классы, лекции, круглые столы, встречи, презентации, концерты, шоу, фестивали, спортивные и развлекательные мероприятия',
    },
    robots: hasFacets ? { index: false, follow: true } : undefined,
  });
}
