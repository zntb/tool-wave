import type { Metadata } from 'next';
import { FavoritesClient } from '@/components/favorites-client';

export const metadata: Metadata = {
  title: 'Favorites - Tool Wave',
  description:
    'Your saved design resources - browse and manage your favorite design resources',
  alternates: {
    canonical: 'https://tool-wave.vercel.app/favorites',
  },
};

export default function FavoritesPage() {
  return <FavoritesClient />;
}
