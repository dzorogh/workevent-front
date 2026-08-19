export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://workevent.ru';
export const SITE_NAME = 'Workevent';

export function getSeoYear(): number {
  const month = new Date().getMonth();
  return month < 10 ? new Date().getFullYear() : new Date().getFullYear() + 1;
}

export function getScheduleYears(startYear = 2025): number[] {
  const endYear = getSeoYear() + 2;
  return Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);
}
