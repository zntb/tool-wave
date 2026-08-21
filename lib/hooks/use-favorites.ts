'use client';

import { useSyncExternalStore, useCallback, useEffect, useMemo } from 'react';
import type { Link } from '@/lib/types';
import { FAVORITES_STORAGE_KEY, type StoredFavorite } from '@/lib/favorites-storage';
import { logger } from '@/lib/logger';

// Module-level store (shared across all hook instances)
let favorites: StoredFavorite[] = [];
const subscribers = new Set<() => void>();
let initialized = false;

// Cache empty array for server snapshot to avoid infinite loop
const emptyFavorites: StoredFavorite[] = [];

function getFavorites(): StoredFavorite[] {
  return favorites;
}

function setFavorites(newFavorites: StoredFavorite[]): void {
  favorites = newFavorites;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(newFavorites));
    } catch {
      logger.error('Failed to save favorites', 'use-favorites');
    }
  }
  // Notify all subscribers
  subscribers.forEach(sub => sub());
}

function subscribe(callback: () => void): () => void {
  subscribers.add(callback);
  return () => {
    subscribers.delete(callback);
  };
}

function getSnapshot(): StoredFavorite[] {
  return getFavorites();
}

function getServerSnapshot(): StoredFavorite[] {
  // On server, return cached empty array
  return emptyFavorites;
}

export function useFavorites() {
  const storedFavorites = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  // Initialize from localStorage on mount (client only)
  useEffect(() => {
    if (typeof window !== 'undefined' && !initialized) {
      initialized = true;
      try {
        const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
        if (stored) {
          const parsed: StoredFavorite[] = JSON.parse(stored);
          setFavorites(parsed);
        } else {
          setFavorites([]);
        }
      } catch {
        setFavorites([]);
      }
    }
  }, []);

  const favoriteIds = useMemo(
    () => new Set(storedFavorites.map(f => f.id)),
    [storedFavorites],
  );
  const favoritesCount = storedFavorites.length;

  const isFavorite = useCallback(
    (linkId: string) => {
      return favoriteIds.has(linkId);
    },
    [favoriteIds],
  );

  const toggleFavorite = useCallback(
    (link: Link) => {
      const hasId = storedFavorites.some(f => f.id === link.id);
      const newFavorites = hasId
        ? storedFavorites.filter(f => f.id !== link.id)
        : [...storedFavorites, { id: link.id, addedAt: Date.now() }];
      setFavorites(newFavorites);
    },
    [storedFavorites],
  );

  const removeFavorite = useCallback(
    (linkId: string) => {
      const newFavorites = storedFavorites.filter(f => f.id !== linkId);
      setFavorites(newFavorites);
    },
    [storedFavorites],
  );

  const clearAllFavorites = useCallback(() => {
    setFavorites([]);
  }, []);

  const exportFavorites = useCallback(() => {
    const data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      favorites: storedFavorites,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tool-wave-favorites-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [storedFavorites]);

  const importFavorites = useCallback(
    (jsonString: string): { success: boolean; count?: number; error?: string } => {
      try {
        const data = JSON.parse(jsonString);

        // Validate format
        if (!data || typeof data !== 'object') {
          return { success: false, error: 'Invalid file format' };
        }
        if (!Array.isArray(data.favorites)) {
          return { success: false, error: 'Invalid favorites data' };
        }

        // Validate each favorite
        const validFavorites: StoredFavorite[] = [];
        for (const item of data.favorites) {
          if (
            item &&
            typeof item === 'object' &&
            typeof item.id === 'string' &&
            item.id.length > 0
          ) {
            validFavorites.push({
              id: item.id,
              addedAt: typeof item.addedAt === 'number' ? item.addedAt : Date.now(),
            });
          }
        }

        if (validFavorites.length === 0) {
          return { success: false, error: 'No valid favorites found in file' };
        }

        // Merge: keep existing favorites, add new ones (deduplicate by id)
        const existingIds = new Set(storedFavorites.map(f => f.id));
        const newFavorites = [...storedFavorites];
        let importCount = 0;

        for (const fav of validFavorites) {
          if (!existingIds.has(fav.id)) {
            newFavorites.push(fav);
            importCount++;
          }
        }

        setFavorites(newFavorites);
        return { success: true, count: importCount };
      } catch {
        return { success: false, error: 'Failed to parse file' };
      }
    },
    [storedFavorites],
  );

  return {
    favoriteIds,
    favoritesCount,
    isFavorite,
    toggleFavorite,
    removeFavorite,
    clearAllFavorites,
    exportFavorites,
    importFavorites,
  };
}

// Export a reset function for testing purposes
export function resetFavoritesStore() {
  favorites = [];
  initialized = false;
  subscribers.clear();
}
