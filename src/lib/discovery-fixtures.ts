import { EventResource, IndustryResource, SearchEventsResourceMeta } from '@/lib/types';

export const DISCOVERY_FIXTURE_MONTH = "СЕНТЯБРЬ '26";

export const DISCOVERY_FIXTURE_INDUSTRIES: IndustryResource[] = [
  { id: 101, title: 'IT', slug: 'it', future_events_count: 1 },
  { id: 102, title: 'PR, реклама и маркетинг', slug: 'marketing', future_events_count: 1 },
  { id: 103, title: 'Управление персоналом', slug: 'hr', future_events_count: 1 },
  { id: 104, title: 'Финансы', slug: 'finance', future_events_count: 1 },
  { id: 105, title: 'Промышленность', slug: 'promyshlennost', future_events_count: 1 },
  { id: 106, title: 'Логистика', slug: 'logistika', future_events_count: 1 },
];

function fixtureEvent(
  partial: Pick<EventResource, 'id' | 'title' | 'cover' | 'start_date' | 'end_date' | 'city' | 'industry'>
): EventResource {
  return {
    description: null,
    gallery: [],
    format: 'conference',
    format_label: 'Конференция',
    website: null,
    phone: null,
    email: null,
    sort_order: 0,
    city_id: partial.city?.id ?? null,
    industry_id: partial.industry?.id ?? 0,
    venue_id: null,
    ...partial,
  };
}

export const DISCOVERY_FIXTURE_EVENTS: EventResource[] = [
  fixtureEvent({
    id: 900001,
    title: 'TNF 2026 — Промышленно-энергетический форум',
    cover: '/discovery/tnf.jpg',
    start_date: '2026-09-14T10:00:00+03:00',
    end_date: '2026-09-14T18:00:00+03:00',
    city: { id: 72, title: 'Тюмень' },
    industry: { id: 105, title: 'Промышленность' },
  }),
  fixtureEvent({
    id: 900002,
    title: 'CeMAT RUSSIA 2026 — Выставка складской логистики',
    cover: '/discovery/cemat.jpg',
    start_date: '2026-09-15T10:00:00+03:00',
    end_date: '2026-09-17T18:00:00+03:00',
    city: { id: 1, title: 'Москва' },
    industry: { id: 106, title: 'Логистика' },
  }),
  fixtureEvent({
    id: 900003,
    title: 'SmartData 2026 — Конференция по инженерии данных',
    cover: '/discovery/smartdata.jpg',
    start_date: '2026-09-23T10:00:00+03:00',
    end_date: '2026-09-23T18:00:00+03:00',
    city: { id: 1, title: 'Москва' },
    industry: { id: 101, title: 'IT' },
  }),
];

export const DISCOVERY_FIXTURE_META: SearchEventsResourceMeta = {
  total: 3,
  per_page: 3,
  current_page: 1,
  last_page: 1,
};
