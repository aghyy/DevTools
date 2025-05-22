"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, ArrowUpRight, X } from 'lucide-react';
import { toast } from 'sonner';
import { removeFromFavorites, updateFavoritePositions } from '@/services/favoriteToolService';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { TopSpacing } from '@/components/top-spacing';
import { getIconComponent } from '@/utils/icons';
import Icon from '@/components/icon';
import { MagicCard } from '@/components/ui/magic-card';
import { useRouter } from 'next/navigation';
import { tools } from '@/utils/tools';
import { useFavoriteTools } from '@/hooks/useFavoriteTools';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { arrayMove, SortableContext, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import type { FavoriteTool } from '@/services/favoriteToolService';

function SortableFavoriteCard({ tool, onClick, onRemove, isDragging }: { tool: FavoriteTool, onClick: () => void, onRemove: (e: React.MouseEvent) => void, isDragging: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: tool.id });
  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : undefined,
        boxShadow: isDragging ? '0 4px 16px 0 rgba(0,0,0,0.10)' : undefined,
        opacity: isDragging ? 0.3 : 1,
      }}
      {...attributes}
      {...listeners}
    >
      <MagicCard className="overflow-hidden cursor-pointer h-[180px]" onClick={onClick}>
        <Card className="h-full border-0 bg-transparent">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {tool.icon && <Icon icon={getIconComponent(tool.icon)} />}
                <CardTitle className="text-xl">{tool.toolName}</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onRemove}
                className="h-8 w-8 -mt-1 -mr-1 text-muted-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <CardDescription className="mt-2">{getToolDescription(tool.toolUrl)}</CardDescription>
          </CardHeader>
          <CardFooter className="absolute bottom-0 w-full flex items-center justify-between">
            <div className="text-sm text-muted-foreground hover:underline">Open tool</div>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
          </CardFooter>
        </Card>
      </MagicCard>
    </div>
  );
}

const getToolDescription = (toolPath: string) => {
  const tool = tools.find(tool => tool.url === toolPath);
  return tool?.description || '';
};

export default function FavoritesPage() {
  const router = useRouter();
  const { favorites, loading, refreshFavorites } = useFavoriteTools();
  const [localFavorites, setLocalFavorites] = useState<FavoriteTool[]>(favorites);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [isReordering, setIsReordering] = useState(false);

  useEffect(() => {
    // Only sync localFavorites from global favorites if not reordering
    if (!isReordering) {
      setLocalFavorites(favorites);
    }
  }, [favorites, isReordering]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleRemove = async (id: number, name: string) => {
    try {
      await removeFromFavorites(id);
      await refreshFavorites(); // Refresh global favorites state
      toast.success('Removed from favorites', {
        description: `${name} has been removed from your favorites.`,
      });
    } catch {
      toast.error('Failed to remove from favorites. Please try again.');
    }
  };

  const activeTool = activeId ? localFavorites.find(f => f.id === activeId) : null;

  return (
    <div className="h-full w-full">
      <div className="relative size-0">
        <Breadcrumb className="absolute z-50 left-20 top-[22px] w-max">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Favorites</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <TopSpacing />

      <div className="w-full px-8 pt-8 pb-24 mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Favorite Tools</h1>
            <p className="text-muted-foreground mt-1">
              Access your favorite tools quickly
            </p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <Skeleton className="h-5 w-1/3 mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-9 w-full" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : localFavorites.length === 0 ? (
          <div className="text-center py-12">
            <div className="mb-4">
              <Heart className="mx-auto h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No Favorite Tools Yet</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Add tools to your favorites for quick access by clicking the heart icon on any tool page.
            </p>
            <Link href="/tools/base64" passHref>
              <Button>Explore Tools</Button>
            </Link>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={event => setActiveId(Number(event.active.id))}
            onDragEnd={async (event) => {
              setActiveId(null);
              const { active, over } = event;
              if (!over || active.id === over.id) return;
              const oldIndex = localFavorites.findIndex(f => f.id === active.id);
              const newIndex = localFavorites.findIndex(f => f.id === over.id);
              if (oldIndex === -1 || newIndex === -1) return;
              const newOrder = arrayMove(localFavorites, oldIndex, newIndex);
              setLocalFavorites(newOrder);
              setIsReordering(true);
              // Persist new order
              const positions = newOrder.map((item, idx) => ({ id: item.id, position: idx }));
              try {
                await updateFavoritePositions(positions);
                // Trigger a background refresh for sidebar/global state
                refreshFavorites(true); // don't await, keeps UI smooth
                setTimeout(() => setIsReordering(false), 500); // allow refresh to complete, then allow sync
              } catch {
                toast.error('Failed to update order.');
                setLocalFavorites(favorites); // revert to global state
                setIsReordering(false);
              }
            }}
            onDragCancel={() => setActiveId(null)}
          >
            <SortableContext items={localFavorites.map(f => f.id)} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {localFavorites.map((tool) => (
                  <SortableFavoriteCard
                    key={tool.id}
                    tool={tool}
                    isDragging={activeId === tool.id}
                    onClick={() => router.push(tool.toolUrl)}
                    onRemove={(e) => {
                      e.stopPropagation();
                      handleRemove(tool.id, tool.toolName);
                    }}
                  />
                ))}
              </div>
            </SortableContext>
            <DragOverlay dropAnimation={{ duration: 200, easing: 'cubic-bezier(.4,2,.6,1)' }}>
              {activeTool && (
                <motion.div
                  layout
                  initial={{ scale: 1, opacity: 0.7 }}
                  animate={{ scale: 1.08, opacity: 1, boxShadow: '0 8px 32px 0 rgba(0,0,0,0.18)' }}
                  exit={{ scale: 1, opacity: 0.7 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  style={{ zIndex: 100 }}
                >
                  <MagicCard className="overflow-hidden cursor-pointer h-[180px]">
                    <Card className="h-full border-0 bg-transparent">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {activeTool.icon && <Icon icon={getIconComponent(activeTool.icon)} />}
                            <CardTitle className="text-xl">{activeTool.toolName}</CardTitle>
                          </div>
                        </div>
                        <CardDescription className="mt-2">{getToolDescription(activeTool.toolUrl)}</CardDescription>
                      </CardHeader>
                      <CardFooter className="absolute bottom-0 w-full flex items-center justify-between">
                        <div className="text-sm text-muted-foreground hover:underline">Open tool</div>
                        <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                      </CardFooter>
                    </Card>
                  </MagicCard>
                </motion.div>
              )}
            </DragOverlay>
          </DndContext>
        )}
      </div>
    </div>
  );
} 