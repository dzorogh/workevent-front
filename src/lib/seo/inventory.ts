import { createSlugWithId } from '@/lib/utils';

/** Пустая посадочная в индексе = дорвей. Канон Москвы не отрезаем. */

export function isIndexableCity(city: { id?: number; events_count?: number }) {
  if (city.id === 1) return true;
  return (city.events_count ?? 0) > 0;
}

export function isIndexableIndustry(industry: {
  future_events_count?: number;
  events_count?: number;
}) {
  if (typeof industry.future_events_count === 'number') {
    return industry.future_events_count > 0;
  }
  return (industry.events_count ?? 0) > 0;
}

type LandingFilters = {
  format?: string | null;
  city_id?: number | string | null;
  industry_id?: number | string | null;
};

/** Пресет/фильтр, который копирует city или industry — на канон, не в индекс. */
export function cloneLandingPath(
  filters: LandingFilters | null | undefined,
  cities: Array<{ id: number; title: string; events_count?: number }>,
  industries: Array<{
    id: number;
    slug?: string | null;
    future_events_count?: number;
    events_count?: number;
  }>,
): string | null {
  if (!filters) return null;

  const format = filters.format ? String(filters.format) : '';
  const cityId = filters.city_id ? Number(filters.city_id) : NaN;
  const industryId = filters.industry_id ? Number(filters.industry_id) : NaN;
  if (format) return null;

  if (Number.isFinite(cityId) && !Number.isFinite(industryId)) {
    const city = cities.find((item) => item.id === cityId);
    if (city && isIndexableCity(city)) {
      return `/city/${createSlugWithId(city.title, city.id)}`;
    }
  }

  if (Number.isFinite(industryId) && !Number.isFinite(cityId)) {
    const industry = industries.find((item) => item.id === industryId);
    if (industry?.slug && isIndexableIndustry(industry)) {
      return `/industry/${industry.slug}`;
    }
  }

  return null;
}
