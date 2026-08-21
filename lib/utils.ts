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

export function buildPaginationUrl(
  basePath: string,
  pageNum: number,
  options?: { view?: string; sort?: string },
): string {
  const params = new URLSearchParams();
  params.set('page', String(pageNum));
  if (options?.view && options.view !== 'grid') {
    params.set('view', options.view);
  }
  if (options?.sort && options.sort !== 'newest') {
    params.set('sort', options.sort);
  }
  return `${basePath}?${params.toString()}`;
}

export interface ActionResult {
  success: boolean;
  error?: string;
}

export async function withErrorHandling(
  fn: () => Promise<void>,
  fallbackMessage: string,
): Promise<ActionResult> {
  try {
    await fn();
    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: fallbackMessage };
  }
}
