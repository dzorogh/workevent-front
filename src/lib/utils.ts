import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { slugify } from 'transliteration';


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function createEventSlug(title: string, id: string | number): string {
  return `${slugify(title, {
    lowercase: true,
    separator: '-',
    trim: true,
    allowedChars: 'a-zA-Z0-9'
  }).slice(0, 60)}-${id}`;
} 

export function getEventIdFromSlug(slug: string): string {
  return slug.split('-').pop() ?? slug;
}

export function formatPrice(price: number): string {
  return price.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 0 });
}

export function formatPhone(phone: string): string {
  return phone.replace(/^(\+7)(\d{3})(\d{3})(\d{2})(\d{2})/, '+7 ($2) $3-$4-$5');
}
