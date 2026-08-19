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

const CITY_PREP: Record<string, string> = {
  Москва: 'в Москве',
  'Санкт-Петербург': 'в Санкт-Петербурге',
  Новосибирск: 'в Новосибирске',
  Екатеринбург: 'в Екатеринбурге',
  Казань: 'в Казани',
  'Ростов-на-Дону': 'в Ростове-на-Дону',
  Краснодар: 'в Краснодаре',
  Владивосток: 'во Владивостоке',
};

/** Сидер резолвит Москву по title; в прод-БД это id=1, slug moskva-1. */
export const MOSCOW_SEED_CITY_IDS = [1] as const;

export type CityCopy = {
  title: string;
  h1: string;
  description: string;
  ogTitle: string;
  ogDescription: string;
  listDescription: string;
};

export function cityPrep(title: string) {
  return CITY_PREP[title] ?? `в ${title}`;
}

export function isMoscowCity(
  city: { id?: number | null; title?: string | null },
  slug?: string | null,
): boolean {
  if (city.id != null && (MOSCOW_SEED_CITY_IDS as readonly number[]).includes(Number(city.id))) {
    return true;
  }

  const haystack = [city.title, slug].filter(Boolean).join(' ').toLowerCase();
  return /москв/.test(haystack) || /moskv/.test(haystack);
}

export function isBrokenCityPrep(text: string | null | undefined, cityTitle?: string): boolean {
  if (!text) return false;
  if (/в москва(?![а-яё])/i.test(text)) return true;
  if (!cityTitle) return false;

  const correct = CITY_PREP[cityTitle];
  const broken = `в ${cityTitle}`;
  if (!correct || correct === broken) return false;

  const escaped = broken.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`${escaped}(?![а-яё])`, 'i').test(text);
}

export function hasMoscowWordstatIntent(text: string | null | undefined): boolean {
  if (!text || isBrokenCityPrep(text)) return false;
  const value = text.toLowerCase();
  return /мероприятия в москве/.test(value) && /конференц/.test(value) && /выставк/.test(value) && /2026/.test(value);
}

export function resolveCityCopy(
  city: { id?: number | null; title: string },
  slug?: string | null,
): CityCopy {
  const prep = cityPrep(city.title);

  if (isMoscowCity(city, slug)) {
    return {
      title: 'Мероприятия в Москве: конференции и выставки 2026 — Workevent',
      h1: 'Мероприятия в Москве: конференции и выставки 2026',
      description:
        'Мероприятия в Москве: конференции, форумы и выставки 2026. Актуальные даты, контакты организаторов и регистрация на Workevent.',
      ogTitle: 'Мероприятия в Москве — конференции и выставки 2026',
      ogDescription: 'Конференции и выставки в Москве на 2026 год.',
      listDescription: 'Мероприятия в Москве: конференции и выставки 2026',
    };
  }

  return {
    title: `Деловые мероприятия ${prep} — Workevent`,
    h1: `Мероприятия ${prep}`,
    description: `Каталог конференций, форумов, выставок и семинаров ${prep}. Актуальные даты, контакты организаторов и регистрация на Workevent.`,
    ogTitle: `Мероприятия ${prep} — Workevent`,
    ogDescription: `Конференции, форумы и выставки ${prep}.`,
    listDescription: `Деловые мероприятия ${prep}`,
  };
}

export function resolveCityVisibleHeading(
  city: { id?: number | null; title: string },
  slug: string | undefined,
  raw: string | null | undefined,
  kind: 'title' | 'h1',
): string {
  const copy = resolveCityCopy(city, slug);
  const fallback = kind === 'h1' ? copy.h1 : copy.title;
  const value = raw?.trim();
  if (!value) return fallback;
  if (isBrokenCityPrep(value, city.title)) return fallback;
  if (isMoscowCity(city, slug) && !hasMoscowWordstatIntent(value)) return fallback;
  return value;
}

export function isIndustryCatalogIntent(text: string | null | undefined): boolean {
  if (!text) return false;
  const value = text.trim();
  return /^мероприятия[:\s—-]/i.test(value) && !/(подборк|календар|план на \d{4}|расписание)/i.test(value);
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
    ? `Расписание выставок: ${industryTitle} на ${year}`
    : `Календарь мероприятий ${year}: расписание выставок`;
  if (!raw?.trim()) return fallback;
  if (isIndustryCatalogIntent(raw) || isBrokenCityPrep(raw)) return fallback;
  if (!/(расписание выставок|календарь мероприятий)/i.test(raw)) return fallback;
  return raw.trim();
}

export function buildFacetedEventsMetadata(searchParams: Record<string, string | string[] | undefined>): Metadata {
  const hasFacets = Object.keys(searchParams).some((key) => {
    const value = searchParams[key];
    if (value === undefined || value === '') return false;
    return true;
  });

  return buildMetadata(null, {
    title: 'Каталог деловых мероприятий — Workevent',
    description:
      'Мероприятия на сайте Workevent. Поиск по датам и индустриям. Конференции, форумы, выставки, семинары, тренинги, мастер-классы, лекции, круглые столы, встречи, презентации, концерты, шоу, фестивали, спортивные и развлекательные мероприятия',
    canonicalPath: '/events',
    openGraph: {
      type: 'website',
      title: 'Каталог деловых мероприятий — Workevent',
      description:
        'Мероприятия на сайте Workevent. Поиск по датам и индустриям. Конференции, форумы, выставки, семинары, тренинги, мастер-классы, лекции, круглые столы, встречи, презентации, концерты, шоу, фестивали, спортивные и развлекательные мероприятия',
      url: `${SITE_URL}/events`,
    },
    twitter: {
      title: 'Каталог деловых мероприятий — Workevent',
      description:
        'Мероприятия на сайте Workevent. Поиск по датам и индустриям. Конференции, форумы, выставки, семинары, тренинги, мастер-классы, лекции, круглые столы, встречи, презентации, концерты, шоу, фестивали, спортивные и развлекательные мероприятия',
    },
    robots: hasFacets ? { index: false, follow: true } : undefined,
  });
}
