"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, ArrowUpRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { MagicCard } from '@/components/ui/magic-card';
import Icon from '@/components/icon';
import { getIconComponent } from '@/utils/icons';
import { useFavoriteTools } from '@/hooks/useFavoriteTools';

export default function DashboardFavorites() {
  const [error] = useState<string | null>(null);
  const router = useRouter();
  const { favorites, loading } = useFavoriteTools();

  // Get only the first 3 favorites to display
  const displayFavorites = favorites.slice(0, 3);

  const routeTo = (path: string) => {
    router.push(path);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-24 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-500">
        {error}
      </div>
    );
  }

  if (displayFavorites.length === 0) {
    return (
      <div className="p-4 text-center border rounded-lg bg-slate-50 dark:bg-slate-900/20">
        <Heart className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
        <p className="text-slate-500 mb-3">No favorite tools yet.</p>
        <Button
          onClick={() => routeTo('/tools/base64')}
          variant="outline"
          size="sm"
        >
          Explore Tools
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {displayFavorites.map((tool) => (
        <MagicCard
          key={tool.id}
          className="overflow-hidden cursor-pointer"
          onClick={() => routeTo(tool.toolUrl)}
        >
          <Card className="h-full border-0 bg-transparent">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="bg-primary/5 p-3 rounded-full">
                {tool.icon && (
                  <Icon icon={getIconComponent(tool.icon)} />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-medium">{tool.toolName}</h3>
                <div className="flex items-center text-xs text-primary/50 mt-1">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  <span>Click to open</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </MagicCard>
      ))}

      {favorites.length > 0 && (
        <Link href="/favorites" className="flex items-center justify-center p-4 text-sm text-primary hover:underline">
          View all favorites
        </Link>
      )}
    </div>
  );
} 