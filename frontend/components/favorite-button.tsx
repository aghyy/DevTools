import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { addToFavorites, removeFromFavorites } from '@/services/favoriteToolService';
import { toast } from 'sonner';
import { useFavoriteTools } from '@/hooks/useFavoriteTools';

interface FavoriteButtonProps {
  toolUrl: string;
  toolName: string;
  iconName?: string;
  className?: string;
}

export default function FavoriteButton({ toolUrl, toolName, iconName, className }: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteId, setFavoriteId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { favorites, refreshFavorites } = useFavoriteTools();

  useEffect(() => {
    const checkFavoriteStatus = () => {
      const favorite = favorites.find(tool => tool.toolUrl === toolUrl);
      if (favorite) {
        setIsFavorite(true);
        setFavoriteId(favorite.id);
      } else {
        setIsFavorite(false);
        setFavoriteId(null);
      }
    };

    checkFavoriteStatus();
  }, [favorites, toolUrl]);

  const handleToggleFavorite = async () => {
    if (!isFavorite) {
      // Add to favorites
      try {
        setIsLoading(true);
        const favoriteTool = await addToFavorites(toolUrl, toolName, iconName);
        setIsFavorite(true);
        setFavoriteId(favoriteTool.id);
        // Refresh favorites in global state
        await refreshFavorites();
        toast.success('Added to favorites', {
          description: `${toolName} has been added to your favorites.`,
          duration: 3000,
        });
      } catch (error) {
        console.error('Error adding to favorites:', error);
        toast.error('Error', {
          description: 'Failed to add to favorites. Please try again.',
          duration: 3000,
        });
      } finally {
        setIsLoading(false);
      }
    } else {
      // Remove from favorites
      try {
        setIsLoading(true);
        if (favoriteId) {
          await removeFromFavorites(favoriteId);
          setIsFavorite(false);
          setFavoriteId(null);
          // Refresh favorites in global state
          await refreshFavorites();
          toast.success('Removed from favorites', {
            description: `${toolName} has been removed from your favorites.`,
            duration: 3000,
          });
        }
      } catch (error) {
        console.error('Error removing from favorites:', error);
        toast.error('Error', {
          description: 'Failed to remove from favorites. Please try again.',
          duration: 3000,
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className={className}
      onClick={handleToggleFavorite}
      disabled={isLoading}
      title={isFavorite ? "Remove from favorites" : "Add to favorites"}
    >
      <Heart className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
    </Button>
  );
} 