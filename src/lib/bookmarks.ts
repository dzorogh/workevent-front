import { Api } from '@/lib/api';
import { EventResource } from '@/lib/types';

export function isEventPast(event: EventResource): boolean {
  const end = event.end_date || event.start_date;
  const today = new Date();
  const stamp = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0'),
  ].join('-');
  return end < stamp;
}

export async function fetchEventsByIds(ids: number[]): Promise<{
  events: EventResource[];
  missing: number[];
}> {
  const results = await Promise.all(
    ids.map(async (id) => {
      try {
        const { data, error } = await Api.GET('/v1/events/{event}', {
          params: { path: { event: id } },
        });
        if (error || !data?.data) {
          return { id, event: null as EventResource | null, gone: true };
        }
        return { id, event: data.data, gone: false };
      } catch {
        return { id, event: null as EventResource | null, gone: false };
      }
    }),
  );

  const events: EventResource[] = [];
  const missing: number[] = [];
  let networkFailures = 0;

  for (const id of ids) {
    const result = results.find((item) => item.id === id);
    if (result?.event) {
      events.push(result.event);
    } else if (result?.gone) {
      missing.push(id);
    } else {
      networkFailures += 1;
    }
  }

  if (events.length === 0 && networkFailures > 0 && missing.length < ids.length) {
    throw new Error('bookmarks-fetch-failed');
  }

  return { events, missing };
}
