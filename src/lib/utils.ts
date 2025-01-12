import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { createEventSlug as createEventSlugGlobal } from "./globalUtils.js"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function createSlugWithId(title: string, id: string | number): string {
  return createEventSlugGlobal(title, id)
}

export function getIdFromSlug(slug: string): string {
  return slug.split('-').pop() ?? slug;
}

export function formatPrice(price: number): string {
  return price.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 0 });
}

export function formatPhone(phone: string): string {
  return phone.replace(/^(\+7)(\d{3})(\d{3})(\d{2})(\d{2})/, '+7 ($2) $3-$4-$5');
}

export function getSeoYear(): number {
  const month = new Date().getMonth();
  return month < 10 ? new Date().getFullYear() : new Date().getFullYear() + 1;
}

export function plural(forms: string[], n: number): string {
  let idx;
  // @see http://docs.translatehouse.org/projects/localization-guide/en/latest/l10n/pluralforms.html
  if (n % 10 === 1 && n % 100 !== 11) {
      idx = 0; // one
  } else if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) {
      idx = 1; // few
  } else {
      idx = 2; // many
  }
  return forms[idx] || '';
}

export function truncateText(text: string, maxLength: number) {
  if (text.length <= maxLength) return text;

  // Find the last space before maxLength
  const lastSpace = text.lastIndexOf(' ', maxLength);
  // If no space found, just slice at maxLength
  const slicedText = lastSpace > 0 ? text.slice(0, lastSpace) : text.slice(0, maxLength);

  return `${slicedText}...`;
};