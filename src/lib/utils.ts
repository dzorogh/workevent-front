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