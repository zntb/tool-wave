import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function generateId(): string {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

export function isUrl(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch {
    return false;
  }
}

export interface ParsedSearchParams {
  page: number;
  view: 'grid' | 'list';
  sort: 'newest' | 'popular' | 'az' | 'za';
}

export function parseSearchParams(params: {
  page?: string;
  view?: string;
  sort?: string;
}): ParsedSearchParams {
  const currentPage = params.page ? parseInt(params.page, 10) : 1;
  return {
    page: isNaN(currentPage) || currentPage < 1 ? 1 : currentPage,
    view: (params.view as ParsedSearchParams['view']) || 'grid',
    sort: (params.sort as ParsedSearchParams['sort']) || 'newest',
  };
}
