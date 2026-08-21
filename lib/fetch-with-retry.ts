import { logger } from '@/lib/logger';

interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  baseDelay: 300,
  maxDelay: 5000,
};

function isRetryableError(error: unknown): boolean {
  if (error instanceof TypeError) {
    // Network errors: "Failed to fetch", "NetworkError", etc.
    const message = error.message.toLowerCase();
    return (
      message.includes('fetch') ||
      message.includes('network') ||
      message.includes('failed to')
    );
  }
  if (error instanceof DOMException && error.name === 'AbortError') {
    return false; // Don't retry aborted requests
  }
  return false;
}

function getDelay(attempt: number, baseDelay: number, maxDelay: number): number {
  const exponentialDelay = baseDelay * Math.pow(2, attempt);
  const jitter = Math.random() * baseDelay;
  return Math.min(exponentialDelay + jitter, maxDelay);
}

export async function fetchWithRetry(
  url: string | URL,
  options?: RequestInit,
  retryOptions?: RetryOptions,
): Promise<Response> {
  const config = { ...DEFAULT_OPTIONS, ...retryOptions };
  let lastError: unknown;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      return response;
    } catch (error) {
      lastError = error;

      if (!isRetryableError(error) || attempt >= config.maxRetries) {
        throw error;
      }

      const delay = getDelay(attempt, config.baseDelay, config.maxDelay);
      logger.warn(
        `Fetch retry ${attempt + 1}/${config.maxRetries} for ${url}`,
        'fetch-with-retry',
        { delay },
      );

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Fetch an admin API endpoint and handle the standard response pattern.
 * Returns data on success, or null on failure (after showing a toast).
 *
 * Usage:
 *   const data = await fetchAdminApi<PopularResource[]>('/api/analytics?type=popular');
 *   if (data) setPopularResources(data);
 */
export async function fetchAdminApi<T>(
  url: string,
  options?: RequestInit,
): Promise<T | null> {
  const { toast } = await import('sonner');
  try {
    const response = await fetchWithRetry(url, options);
    const data = await response.json();
    if (data.success) {
      return data.data as T;
    }
    toast.error(data.error || 'Request failed');
    return null;
  } catch {
    toast.error('Network error — please try again');
    return null;
  }
}
