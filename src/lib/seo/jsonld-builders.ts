import type {
  BreadcrumbList,
  CollectionPage,
  Event,
  FAQPage,
  ItemList,
  BlogPosting,
  Organization,
  Place,
  VirtualLocation,
  WebSite,
  WithContext,
} from 'schema-dts';
import type { EventResource } from '@/lib/types';
import { createSlugWithId } from '@/lib/utils';
import removeMarkdown from 'remove-markdown';
import { truncateText } from '@/lib/utils';
import { SITE_NAME, SITE_URL } from './constants';
import type { FaqItem } from './faq';

export function buildOrganizationJsonLd(): WithContext<Organization> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/icon.svg`,
    description: 'Каталог деловых мероприятий России: конференции, форумы, семинары, выставки',
  };
}

export function buildWebSiteJsonLd(): WithContext<WebSite> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/events?query={search_term_string}`,
      },
      query: 'required name=search_term_string',
      'query-input': {
        '@type': 'PropertyValueSpecification',
        valueRequired: true,
        valueName: 'search_term_string',
      },
    },
  } as WithContext<WebSite>;
}

export function buildBreadcrumbJsonLd(
  items: Array<{ name: string; url?: string }>,
): WithContext<BreadcrumbList> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      ...(item.url ? { item: item.url } : {}),
    })),
  };
}

type EventSpeaker = {
  name?: string;
  title?: string;
  url?: string;
  website?: string;
};

function getOrganizerName(event: EventResource): string {
  if (event.website) {
    try {
      return new URL(event.website).hostname.replace(/^www\./, '');
    } catch {
      // fall through to event title
    }
  }

  return event.title;
}

function getEventSpeakers(event: EventResource): EventSpeaker[] {
  const speakers = (event as EventResource & { speakers?: EventSpeaker[] }).speakers;
  return Array.isArray(speakers) ? speakers : [];
}

function buildEventLocation(
  event: EventResource,
  eventUrl: string,
  isOnline: boolean,
): Place | VirtualLocation | Array<Place | VirtualLocation> | undefined {
  const physicalLocation: Place | undefined = event.venue
    ? {
      '@type': 'Place',
      name: event.venue.title,
      address: {
        '@type': 'PostalAddress',
        streetAddress: event.venue.address ?? undefined,
        addressLocality: event.city?.title,
        addressCountry: 'RU',
      },
    }
    : event.city
      ? {
        '@type': 'Place',
        name: event.city.title,
        address: {
          '@type': 'PostalAddress',
          addressLocality: event.city.title,
          addressCountry: 'RU',
        },
      }
      : undefined;

  const virtualLocation: VirtualLocation = {
    '@type': 'VirtualLocation',
    url: event.website || eventUrl,
  };

  if (isOnline && physicalLocation) {
    return [virtualLocation, physicalLocation];
  }

  if (isOnline) {
    return virtualLocation;
  }

  return physicalLocation;
}

function buildEventOffers(event: EventResource, eventUrl: string) {
  const tariffs = (event.tariffs ?? []).filter((tariff) => tariff.is_active !== false);
  if (tariffs.length === 0) {
    return undefined;
  }

  const prices = tariffs.map((tariff) => tariff.price);
  const isPast = Boolean(event.end_date && new Date(event.end_date).getTime() < Date.now());
  const availability = isPast
    ? 'https://schema.org/SoldOut' as const
    : 'https://schema.org/InStock' as const;

  if (tariffs.length > 1) {
    return {
      '@type': 'AggregateOffer' as const,
      lowPrice: Math.min(...prices),
      highPrice: Math.max(...prices),
      priceCurrency: 'RUB',
      offerCount: tariffs.length,
      availability,
      url: eventUrl,
    };
  }

  return {
    '@type': 'Offer' as const,
    price: tariffs[0].price,
    priceCurrency: 'RUB',
    availability,
    url: eventUrl,
    ...(event.end_date ? { priceValidUntil: event.end_date } : {}),
  };
}

export function buildEventJsonLd(event: EventResource): WithContext<Event> {
  const eventUrl = `${SITE_URL}/event/${createSlugWithId(event.title, event.id)}`;
  const description = truncateText(removeMarkdown(event.description ?? event.title), 300);
  const isOnline = event.format === 'webinar';
  const hasPhysicalPlace = Boolean(event.venue || event.city);
  const offers = buildEventOffers(event, eventUrl);
  const performers = getEventSpeakers(event)
    .map((speaker) => {
      const name = speaker.name ?? speaker.title;
      if (!name) return null;

      return {
        '@type': 'Person' as const,
        name,
        ...(speaker.url || speaker.website ? { url: speaker.url ?? speaker.website } : {}),
      };
    })
    .filter((person): person is NonNullable<typeof person> => person !== null);

  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    description,
    ...(event.start_date ? { startDate: event.start_date } : {}),
    ...(event.end_date ? { endDate: event.end_date } : {}),
    location: buildEventLocation(event, eventUrl, isOnline),
    image: event.cover,
    url: eventUrl,
    ...(offers ? { offers } : {}),
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: isOnline && hasPhysicalPlace
      ? 'https://schema.org/MixedEventAttendanceMode'
      : isOnline
        ? 'https://schema.org/OnlineEventAttendanceMode'
        : 'https://schema.org/OfflineEventAttendanceMode',
    organizer: {
      '@type': 'Organization',
      name: getOrganizerName(event),
      ...(event.website ? { url: event.website } : {}),
      ...(event.email ? { email: event.email } : {}),
      ...(event.phone ? { telephone: event.phone } : {}),
    },
    ...(performers.length
      ? { performer: performers.length === 1 ? performers[0] : performers }
      : {}),
  };
}

export function buildFaqPageJsonLd(items: FaqItem[]): WithContext<FAQPage> | null {
  if (items.length === 0) {
    return null;
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

export function buildItemListJsonLd(options: {
  name: string;
  description?: string;
  url: string;
  events: EventResource[];
}): WithContext<ItemList> {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: options.name,
    description: options.description,
    url: options.url,
    itemListElement: options.events.map((event, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: event.title,
      url: `${SITE_URL}/event/${createSlugWithId(event.title, event.id)}`,
      image: event.cover,
    })),
  };
}

export function buildCollectionPageJsonLd(options: {
  name: string;
  description: string;
  url: string;
}): WithContext<CollectionPage> {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: options.name,
    description: options.description,
    url: options.url,
  };
}

export function buildArticleJsonLd(post: {
  id: number;
  title: string;
  content?: string;
  cover: string | '';
  created_at?: string;
}): WithContext<BlogPosting> {
  const url = `${SITE_URL}/blog/${createSlugWithId(post.title, post.id)}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    image: post.cover || undefined,
    datePublished: post.created_at,
    dateModified: post.created_at,
    url,
    description: truncateText(removeMarkdown(post.content ?? ''), 200),
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/icon.svg`,
      },
    },
    author: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
  };
}
