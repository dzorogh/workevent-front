import { Api } from '@/lib/api';
import { createSlugWithId } from '@/lib/utils';
import { getSeoYear } from './constants';

export async function getSeoHubs(limit = 8) {
  try {
    const [cities, industries] = await Promise.all([
      Api.GET('/v1/cities').then((res) => res.data?.data ?? []),
      Api.GET('/v1/industries').then((res) =>
        (res.data?.data ?? []).filter((industry) => (industry.future_events_count ?? 0) > 0),
      ),
    ]);

    const topCities = [...cities]
      .sort((a, b) => (b.events_count ?? 0) - (a.events_count ?? 0))
      .slice(0, limit)
      .map((city) => ({
        id: city.id,
        title: city.title,
        href: `/city/${createSlugWithId(city.title, city.id)}`,
      }));

    const topIndustries = industries
      .filter((industry) => industry.slug)
      .slice(0, limit)
      .map((industry) => ({
        id: industry.id,
        title: industry.title,
        slug: industry.slug as string,
        href: `/industry/${industry.slug}`,
      }));

    return {
      topCities,
      topIndustries,
      seoYear: getSeoYear(),
    };
  } catch {
    return {
      topCities: [],
      topIndustries: [],
      seoYear: getSeoYear(),
    };
  }
}
