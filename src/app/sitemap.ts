import type { MetadataRoute } from 'next';
import { Api } from '@/lib/api';
import { createSlugWithId } from '@/lib/utils';
import { getScheduleYears, SITE_URL } from '@/lib/seo/constants';

export const revalidate = 3600;

const SOURCE_TIMEOUT_MS = 8_000;
const EVENTS_BUDGET_MS = 15_000;
const EVENTS_PER_PAGE = 100;
const MAX_EVENT_PAGES = 50;
const MAX_SITEMAP_URLS = 45_000;

type EventEntry = { id: number; title: string };

async function loadSource<T>(
  label: string,
  loader: (signal: AbortSignal) => Promise<T>,
  fallback: T,
  timeoutMs = SOURCE_TIMEOUT_MS,
): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await loader(controller.signal);
  } catch (error) {
    console.error(`sitemap: skipped ${label}`, error);
    return fallback;
  } finally {
    clearTimeout(timer);
  }
}

async function fetchAllEvents(): Promise<EventEntry[]> {
  const events: EventEntry[] = [];
  let page = 1;
  let lastPage = 1;
  const startedAt = Date.now();

  while (page <= lastPage && page <= MAX_EVENT_PAGES) {
    const remaining = EVENTS_BUDGET_MS - (Date.now() - startedAt);
    if (remaining <= 0) {
      console.error('sitemap: events budget exceeded, using partial list');
      break;
    }

    const response = await loadSource(
      `events page ${page}`,
      (signal) =>
        Api.GET('/v1/events', {
          params: {
            query: {
              page,
              per_page: EVENTS_PER_PAGE,
            },
          },
          signal,
        }),
      null,
      Math.min(SOURCE_TIMEOUT_MS, remaining),
    );

    if (!response?.data) {
      break;
    }

    for (const event of response.data.data ?? []) {
      if (event.id && event.title) {
        events.push({ id: event.id, title: event.title });
      }
    }

    lastPage = response.data.meta?.last_page ?? page;
    page += 1;
  }

  return events;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/events`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/blog`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
  ];

  try {
    const [events, presets, industries, cities, posts] = await Promise.all([
      fetchAllEvents(),
      loadSource(
        'presets',
        async (signal) => (await Api.GET('/v1/presets/slugs', { signal })).data?.data ?? [],
        [],
      ),
      loadSource(
        'industries',
        async (signal) => (await Api.GET('/v1/industries/slugs', { signal })).data?.data ?? [],
        [],
      ),
      loadSource(
        'cities',
        async (signal) => (await Api.GET('/v1/cities', { signal })).data?.data ?? [],
        [],
      ),
      loadSource(
        'posts',
        async (signal) => (await Api.GET('/v1/posts', { signal })).data?.data ?? [],
        [],
      ),
    ]);

    const eventPages: MetadataRoute.Sitemap = events.map((event) => ({
      url: `${SITE_URL}/event/${createSlugWithId(event.title, event.id)}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    const presetPages: MetadataRoute.Sitemap = presets
      .filter((preset) => preset.slug)
      .map((preset) => ({
        url: `${SITE_URL}/events/${preset.slug}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.8,
      }));

    const scheduleYears = getScheduleYears();
    const schedulePages = scheduleYears.flatMap((year): MetadataRoute.Sitemap => {
      const yearPages: MetadataRoute.Sitemap = [
        {
          url: `${SITE_URL}/schedule/${year}`,
          lastModified: now,
          changeFrequency: 'weekly' as const,
          priority: 0.8,
        },
      ];

      const industryPages: MetadataRoute.Sitemap = industries
        .filter((industry) => industry.slug)
        .map((industry) => ({
          url: `${SITE_URL}/schedule/${year}/${industry.slug}`,
          lastModified: now,
          changeFrequency: 'weekly' as const,
          priority: 0.7,
        }));

      return [...yearPages, ...industryPages];
    });

    const blogPages: MetadataRoute.Sitemap = posts
      .filter((post) => post.id && post.title)
      .map((post) => ({
        url: `${SITE_URL}/blog/${createSlugWithId(post.title, post.id)}`,
        lastModified: post.updated_at ? new Date(post.updated_at) : now,
        changeFrequency: 'monthly',
        priority: 0.6,
      }));

    const cityPages: MetadataRoute.Sitemap = cities
      .filter((city) => city.id && city.title)
      .map((city) => ({
        url: `${SITE_URL}/city/${createSlugWithId(city.title, city.id)}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.7,
      }));

    const industryPages: MetadataRoute.Sitemap = industries
      .filter((industry) => industry.slug)
      .map((industry) => ({
        url: `${SITE_URL}/industry/${industry.slug}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.7,
      }));

    return [
      ...staticPages,
      ...eventPages,
      ...presetPages,
      ...schedulePages,
      ...blogPages,
      ...cityPages,
      ...industryPages,
    ].slice(0, MAX_SITEMAP_URLS);
  } catch (error) {
    console.error('sitemap: falling back to static pages', error);
    return staticPages;
  }
}
