'use client';

import { useCallback } from 'react';

const CSRF_HEADER = 'x-csrf-token';

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

/**
 * Returns a function that adds the CSRF token header to fetch options.
 * Use this when making state-changing requests to admin API routes.
 */
export function useCsrfHeaders() {
  const getHeaders = useCallback(
    (extra?: Record<string, string>): Record<string, string> => {
      const token = getCookie('csrf_token');
      return {
        ...extra,
        ...(token ? { [CSRF_HEADER]: token } : {}),
      };
    },
    [],
  );

  return { getHeaders };
}
