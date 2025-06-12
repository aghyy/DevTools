import { useEffect } from "react";
import { useAtom } from "jotai";
import { getFavoriteTools } from "@/services/favoriteToolService";
import {
  favoriteToolsAtom,
  isLoadingFavoritesAtom,
} from "@/atoms/favorite-tools";
import { isGuestAtom } from "@/atoms/auth";
import { toast } from "sonner";

export function useFavoriteTools() {
  const [favorites, setFavorites] = useAtom(favoriteToolsAtom);
  const [loading, setLoading] = useAtom(isLoadingFavoritesAtom);
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
    } catch {
      toast.error("Failed to fetch favorite tools.");
    } finally {
      if (!isBackground) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    refreshFavorites();
  }, [isGuest]);

  return { favorites, loading, refreshFavorites, isGuest };
}
