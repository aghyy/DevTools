"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, ArrowUpRight, X } from 'lucide-react';
import { toast } from 'sonner';
import { removeFromFavorites, updateFavoritePositions } from '@/services/favoriteToolService';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { TopSpacing } from '@/components/top-spacing';
import { getIconComponent } from '@/utils/icons';
import Icon from '@/components/icon';
import { MagicCard } from '@/components/ui/magic-card';
import { useRouter } from 'next/navigation';
import { tools } from '@/utils/tools';
import { useFavoriteTools } from '@/hooks/use-favorite-tools';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { arrayMove, SortableContext, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import type { FavoriteTool } from '@/services/favoriteToolService';

function SortableFavoriteCard({ tool, onClick, onRemove, isDragging, index }: { tool: FavoriteTool, onClick: () => void, onRemove: (e: React.MouseEvent) => void, isDragging: boolean, index: number }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: tool.id });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.1,
        delay: index * 0.05
      }}
    >
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
    </motion.div>
  );
}

const getToolDescription = (toolPath: string) => {
  const tool = tools.find(tool => tool.url === toolPath);
  return tool?.description || '';
};

export default function FavoritesPage() {
  const router = useRouter();
  const { favorites, loading, refreshFavorites } = useFavoriteTools();
  const [localFavorites, setLocalFavorites] = useState<FavoriteTool[] | null>(null);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [isReordering, setIsReordering] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [showEmpty, setShowEmpty] = useState(false);

  // Initial state sync
  useEffect(() => {
    if (!loading) {
      setLocalFavorites(favorites);
      // Set initial load to false after a delay to allow animations to complete
      const timer = setTimeout(() => {
        setIsInitialLoad(false);
        setShowEmpty(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [loading, favorites]);

  // Reordering sync
  useEffect(() => {
    if (!isReordering && localFavorites !== null) {
      setLocalFavorites(favorites);
    }
  }, [favorites, isReordering, localFavorites]);

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

  const activeTool = activeId && localFavorites ? localFavorites.find(f => f.id === activeId) : null;

  // Don't render anything until we have the initial state
  if (loading || localFavorites === null) {
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
        </div>
      </div>
    );
  }

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

        {localFavorites?.length === 0 ? (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: showEmpty ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          >
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
          </motion.div>
        ) : localFavorites && localFavorites.length > 0 ? (
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
                {localFavorites.map((tool, index) => (
                  <SortableFavoriteCard
                    key={tool.id}
                    tool={tool}
                    index={isInitialLoad ? index : 0}
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
                <div style={{ zIndex: 100 }}>
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
                </div>
              )}
            </DragOverlay>
          </DndContext>
        ) : null}
      </div>
    </div>
  );
}