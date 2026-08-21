'use client';

import { useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

/**
 * Returns a stable `handleSearch` function that navigates to /search?q=...
 * while preserving existing search params (view, sort, etc.).
 *
 * @param onAfterSearch - Optional callback after navigation (e.g., close menu)
 */
export function useSearchNavigation(onAfterSearch?: () => void) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSearch = useCallback(
    (query: string) => {
      if (query.trim()) {
        const params = new URLSearchParams(searchParams.toString());
        params.set('q', query.trim());
        router.push(`/search?${params.toString()}`);
        onAfterSearch?.();
      }
    },
    [router, searchParams, onAfterSearch],
  );

  return { handleSearch };
}
