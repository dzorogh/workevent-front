import Link from 'next/link';
import { Route } from 'next';
import { createSlugWithId } from '@/lib/utils';
import { getSeoYear } from '@/lib/seo/constants';
import { getSeoHubs } from '@/lib/seo/hubs';
import type { EventResource } from '@/lib/types';

type RelatedLink = {
  href: string;
  label: string;
};

type InternalLinksProps = {
  variant?: 'home' | 'event' | 'related';
  event?: EventResource;
  links?: RelatedLink[];
};

const chipClassName = 'rounded-full border px-3 py-1 text-sm hover:bg-secondary';

function RelatedNav({ links }: { links: RelatedLink[] }) {
  if (links.length === 0) return null;

  return (
    <nav aria-label="Связанные разделы" className="flex flex-wrap gap-2">
      {links.map((link) => (
        <Link key={link.href} href={link.href as Route} className={chipClassName}>
          {link.label}
        </Link>
      ))}
    </nav>
  );
}

export default async function InternalLinks({ variant = 'home', event, links }: InternalLinksProps) {
  const seoYear = getSeoYear();

  if (variant === 'related') {
    return <RelatedNav links={links ?? []} />;
  }

  if (variant === 'event' && event) {
    const industry = event.industries?.[0];
    const industrySlug = industry?.slug;
    const citySlug = event.city ? createSlugWithId(event.city.title, event.city.id) : null;

    return (
      <RelatedNav
        links={[
          ...(event.city && citySlug
            ? [{ href: `/city/${citySlug}`, label: `Мероприятия в ${event.city.title}` }]
            : []),
          ...(industrySlug
            ? [{ href: `/industry/${industrySlug}`, label: industry?.title ?? industrySlug }]
            : []),
          {
            href: `/schedule/${seoYear}${industrySlug ? `/${industrySlug}` : ''}`,
            label: `Календарь на ${seoYear}`,
          },
        ]}
      />
    );
  }

  const { topCities, topIndustries } = await getSeoHubs();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Мероприятия по городам</h2>
        <div className="flex flex-wrap gap-2">
          {topCities.map((city) => (
            <Link key={city.id} href={city.href as Route} className={chipClassName}>
              {city.title}
            </Link>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Мероприятия по отраслям</h2>
        <div className="flex flex-wrap gap-2">
          {topIndustries.map((industry) => (
            <Link key={industry.id} href={industry.href as Route} className={chipClassName}>
              {industry.title}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
