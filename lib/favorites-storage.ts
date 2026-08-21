export const FAVORITES_STORAGE_KEY = 'tool-wave';

export interface StoredFavorite {
  id: string;
  addedAt: number;
}

export function getStoredFavorites(): StoredFavorite[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}
