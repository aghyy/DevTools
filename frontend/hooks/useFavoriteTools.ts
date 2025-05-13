import { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { getFavoriteTools } from '@/services/favoriteToolService';
import { favoriteToolsAtom, isLoadingFavoritesAtom } from '@/atoms/favoriteTools';

export function useFavoriteTools() {
  const [favorites, setFavorites] = useAtom(favoriteToolsAtom);
  const [loading, setLoading] = useAtom(isLoadingFavoritesAtom);
  const [error, setError] = useState<Error | null>(null);

  const refreshFavorites = async () => {
    try {
      setLoading(true);
      const data = await getFavoriteTools();
      setFavorites(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching favorite tools:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshFavorites();
  }, []);

  return { favorites, loading, error, refreshFavorites };
} 