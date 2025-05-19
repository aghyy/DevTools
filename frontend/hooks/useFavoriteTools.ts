import { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { getFavoriteTools } from '@/services/favoriteToolService';
import { favoriteToolsAtom, isLoadingFavoritesAtom } from '@/atoms/favoriteTools';
import { isGuestAtom } from '@/atoms/auth';

export function useFavoriteTools() {
  const [favorites, setFavorites] = useAtom(favoriteToolsAtom);
  const [loading, setLoading] = useAtom(isLoadingFavoritesAtom);
  const [error, setError] = useState<Error | null>(null);
  const [isGuest] = useAtom(isGuestAtom);

  const refreshFavorites = async (isBackground = false) => {
    try {
      if (!isBackground) {
        setLoading(true);
      }
      if (isGuest) {
        setFavorites([]);
        return;
      }
      const data = await getFavoriteTools();
      setFavorites(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching favorite tools:', err);
    } finally {
      if (!isBackground) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    refreshFavorites();
  }, [isGuest]);

  return { favorites, loading, error, refreshFavorites, isGuest };
} 