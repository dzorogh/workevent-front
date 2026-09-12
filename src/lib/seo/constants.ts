export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://workevent.ru';
export const SITE_NAME = 'Workevent';

export function getSeoYear(): number {
  const month = new Date().getMonth();
  return month < 10 ? new Date().getFullYear() : new Date().getFullYear() + 1;
}

export function getScheduleYears(startYear?: number): number[] {
  const from = startYear ?? new Date().getFullYear();
  const endYear = getSeoYear() + 2;
  if (endYear < from) {
    return [from];
  }
  return Array.from({ length: endYear - from + 1 }, (_, i) => from + i);
}
