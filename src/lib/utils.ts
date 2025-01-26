import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { createEventSlug as createEventSlugGlobal } from "./globalUtils.js"
import { Route } from "next"
import * as crypto from 'crypto';
import { EventResource } from "./types.js";

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

const algorithm = 'aes-256-cbc';
const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY ?? '';
const iv = process.env.NEXT_PUBLIC_ENCRYPTION_IV ?? '';

function encrypt(text: string): string {
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(key, 'hex'), Buffer.from(iv, 'hex'));
  let encrypted = cipher.update(text, 'utf-8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

function decrypt(encryptedText: string): string {
  const decipher = crypto.createDecipheriv(algorithm, Buffer.from(key, 'hex'), Buffer.from(iv, 'hex'));
  let decrypted = decipher.update(encryptedText, 'hex', 'utf-8');
  decrypted += decipher.final('utf-8');
  return decrypted;
}

export function encodeUrl(url: string, params: Record<string, string>): Route {
  const urlObject = new URL(url)

  urlObject.searchParams.set("utm_source", "workevent.ru")

  Object.entries(params).forEach(([key, value]) => {
    urlObject.searchParams.set(key, value)
  })

  const encodedUrl = encrypt(urlObject.toString());

  return "/goto/" + encodedUrl as Route
}

export function decodeUrl(encodedUrl: string): string {
  const decodedUrl = decrypt(encodedUrl)
  return decodedUrl
}

export function formatEventDates(event: EventResource) {
  // return "19-22 октября 2025" if dateStart and dateEnd are in the same month and year
  // return "19 окт - 22 нояб 2025" if dateStart and dateEnd are in different months

  const dateStart = new Date(event.start_date);
  const dateEnd = event.end_date ? new Date(event.end_date) : dateStart;

  const months = [
      'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
      'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
  ];

  const shortMonths = [
      'янв', 'фев', 'мар', 'апр', 'мая', 'июня',
      'июл', 'авг', 'сен', 'окт', 'нояб', 'дек'
  ];

  if (dateStart.getMonth() === dateEnd.getMonth() &&
      dateStart.getFullYear() === dateEnd.getFullYear()) {
      return `${dateStart.getDate()}-${dateEnd.getDate()} ${months[dateStart.getMonth()]} ${dateStart.getFullYear()}`;
  }

  return `${dateStart.getDate()} ${shortMonths[dateStart.getMonth()]} - ${dateEnd.getDate()} ${shortMonths[dateEnd.getMonth()]} ${dateStart.getFullYear()}`;
}