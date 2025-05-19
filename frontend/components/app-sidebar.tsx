"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter, SidebarMenuSub, SidebarMenuSubItem, SidebarHeader } from "@/components/ui/sidebar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Icon from "@/components/icon"
import { Settings, ChevronsUpDown, ChevronDown, ChevronRight, LogOut, Heart, GripVertical, User, LogIn } from "lucide-react"
import { logout as authLogout } from "@/services/auth"
import { sidebarItems } from "@/utils/tools"
import { useFavoriteTools } from "@/hooks/useFavoriteTools"
import { getIconComponent } from "@/utils/icons"
import { IoEye, IoPencil } from "react-icons/io5"
import { useAtom } from "jotai"
import { isGuestAtom, initializeGuestStateAtom, userDataAtom } from "@/atoms/auth"
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { updateFavoritePositions } from '@/services/favoriteToolService';
import type { FavoriteTool } from '@/services/favoriteToolService';

function SortableFavorite({ favorite, onClick }: { favorite: FavoriteTool, onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useSortable({ id: favorite.id });
  return (
    <SidebarMenuSubItem
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform) + (isDragging ? ' scale(1.04)' : ''),
        transition: 'transform 200ms cubic-bezier(.4,2,.6,1), opacity 200ms cubic-bezier(.4,2,.6,1), box-shadow 200ms cubic-bezier(.4,2,.6,1)',
        opacity: isDragging ? 0.7 : 1,
        boxShadow: isDragging ? '0 4px 16px 0 rgba(0,0,0,0.10)' : undefined,
        zIndex: isDragging ? 10 : undefined,
      }}
      {...attributes}
    >
      <SidebarMenuButton asChild>
        <div className="flex items-center cursor-default" onClick={onClick}>
          {favorite.icon ? (
            <Icon icon={getIconComponent(favorite.icon)} />
          ) : (
            <Heart className="h-4 w-4 mr-2 text-muted-foreground" />
          )}
          <span>{favorite.toolName}</span>
          <button
            {...listeners}
            tabIndex={-1}
            className="ml-auto p-1 cursor-grab hover:bg-muted/50 rounded text-muted-foreground"
            style={{ background: 'none', border: 'none' }}
            aria-label="Drag to reorder"
            onClick={e => e.stopPropagation()}
          >
            <GripVertical className="h-4 w-4" />
          </button>
        </div>
      </SidebarMenuButton>
    </SidebarMenuSubItem>
  );
}

export function AppSidebar() {
  const [isGuest, setIsGuest] = useAtom(isGuestAtom);
  const [userData] = useAtom(userDataAtom);

  const [openStates, setOpenStates] = useState({
    codeSnippets: false,
    tools: true,
    favorites: !isGuest,
  });

  useEffect(() => {
    setOpenStates(prev => ({
      ...prev,
      favorites: !isGuest
    }));
  }, [isGuest]);

  const [, initializeGuestState] = useAtom(initializeGuestStateAtom);
  const router = useRouter();
  const { favorites, loading, refreshFavorites } = useFavoriteTools();
  const [sidebarFavorites, setSidebarFavorites] = useState<FavoriteTool[]>(favorites);
  const [isReordering, setIsReordering] = useState(false);

  useEffect(() => {
    initializeGuestState();
  }, [initializeGuestState]);

  useEffect(() => {
    if (!isReordering) {
      setSidebarFavorites(favorites);
    }
  }, [favorites, isReordering]);

  const signout = async () => {
    try {
      await authLogout();
      router.push(window.location.href);
      setTimeout(() => {
        setIsGuest(true);
      }, 500);
    } catch (error) {
      console.log("Error signing out:", error);
    }
  };

  const toggleCollapse = (key: keyof typeof openStates) => {
    setOpenStates(prev => ({ ...prev, [key]: !prev[key] }));
  }

  const routeTo = (path: string) => {
    router.push(path);
  }

  // Filter out the favorites item from general items
  const generalItems = sidebarItems.general.filter(item => item.title !== "Favorites");

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center justify-center p-3">
          <div className="size-10 absolute left-3 pointer-events-none">
            <Image src="/images/icons/devtools-dark.png" alt="DevTools Logo" width={40} height={40} />
          </div>
          <div className="font-semibold">DevTools</div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>General</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {generalItems.map(({ title, url, icon }) => (
                <SidebarMenuItem key={title}>
                  <SidebarMenuButton asChild>
                    <div className="cursor-default" onClick={() => routeTo(url)}>
                      <Icon icon={icon} />
                      <span>{title}</span>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              {/* Favorites Dropdown */}
              <SidebarMenu>
                <Collapsible open={openStates.favorites} onOpenChange={() => toggleCollapse('favorites')} className="group/collapsible">
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton asChild>
                        <div className="cursor-default">
                          <Heart className={`h-4 w-4 mr-2`} />
                          <span>Favorites</span>
                          {openStates.favorites ? <ChevronDown className="ml-auto" /> : <ChevronRight className="ml-auto" />}
                        </div>
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {loading ? (
                          <SidebarMenuSubItem>
                            <SidebarMenuButton asChild className="hover:bg-inherit active:bg-inherit">
                              <div className="cursor-default opacity-50">
                                <span>Loading...</span>
                              </div>
                            </SidebarMenuButton>
                          </SidebarMenuSubItem>
                        ) : favorites.length === 0 ? (
                          <SidebarMenuSubItem>
                            <SidebarMenuButton asChild className="hover:bg-inherit active:bg-inherit">
                              <div className="cursor-default opacity-50">
                                <span>{isGuest ? "Log in to add favorites" : "No favorites yet"}</span>
                              </div>
                            </SidebarMenuButton>
                          </SidebarMenuSubItem>
                        ) : (
                          <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={async (event) => {
                              const { active, over } = event;
                              if (!over || active.id === over.id) return;
                              const oldIndex = sidebarFavorites.findIndex(f => f.id === active.id);
                              const newIndex = sidebarFavorites.findIndex(f => f.id === over.id);
                              if (oldIndex === -1 || newIndex === -1) return;
                              const newOrder = arrayMove(sidebarFavorites, oldIndex, newIndex);
                              setSidebarFavorites(newOrder);
                              setIsReordering(true);
                              // Persist new order
                              const positions = newOrder.map((item, idx) => ({ id: item.id, position: idx }));
                              try {
                                await updateFavoritePositions(positions);
                                refreshFavorites(true);
                                setTimeout(() => setIsReordering(false), 500);
                              } catch {
                                setSidebarFavorites(favorites);
                                setIsReordering(false);
                              }
                            }}
                          >
                            <SortableContext
                              key={sidebarFavorites.map(f => f.id).join('-')}
                              items={sidebarFavorites.map(f => f.id)}
                              strategy={verticalListSortingStrategy}
                            >
                              {sidebarFavorites.map((favorite) => (
                                <SortableFavorite
                                  key={favorite.id}
                                  favorite={favorite}
                                  onClick={() => routeTo(favorite.toolUrl)}
                                />
                              ))}
                            </SortableContext>
                          </DndContext>
                        )}
                        {!isGuest && (
                          <SidebarMenuSubItem>
                            <SidebarMenuButton asChild>
                              <div className="cursor-default" onClick={() => routeTo('/favorites')}>
                                <IoPencil className="h-4 w-4 mr-2 text-muted-foreground" />
                                <span className="text-muted-foreground">Manage Favorites</span>
                              </div>
                            </SidebarMenuButton>
                          </SidebarMenuSubItem>
                        )}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              </SidebarMenu>

              {/* Tools Dropdown */}
              {Object.entries({ tools: sidebarItems.tools }).map(([key, { title, icon, items }]) => (
                <SidebarMenu key={key}>
                  <Collapsible open={openStates[key as keyof typeof openStates]} onOpenChange={() => toggleCollapse(key as keyof typeof openStates)} className="group/collapsible">
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton asChild>
                          <div className="cursor-default">
                            <Icon icon={icon} />
                            <span>{title}</span>
                            {openStates[key as keyof typeof openStates] ? <ChevronDown className="ml-auto" /> : <ChevronRight className="ml-auto" />}
                          </div>
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {items.map(({ title, url, icon }) => (
                            <SidebarMenuSubItem key={title}>
                              <SidebarMenuButton asChild>
                                <div className="cursor-default" onClick={() => routeTo(url)}>
                                  <Icon icon={icon} />
                                  <span>{title}</span>
                                </div>
                              </SidebarMenuButton>
                            </SidebarMenuSubItem>
                          ))}
                          <SidebarMenuSubItem>
                            <SidebarMenuButton asChild>
                              <div className="cursor-default" onClick={() => routeTo('/tools')}>
                                <IoEye className="h-4 w-4 mr-2 text-muted-foreground" />
                                <span className="text-muted-foreground">View All Tools</span>
                              </div>
                            </SidebarMenuButton>
                          </SidebarMenuSubItem>
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                </SidebarMenu>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem suppressHydrationWarning>
            {isGuest ? (
              <SidebarMenuButton
                className="h-fit flex items-center justify-center"
                variant="primary"
                onClick={() => routeTo('/auth/login')}
              >
                <LogIn className="h-4 w-4" />
                <span>Log in</span>
              </SidebarMenuButton>
            ) : (
              userData && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild disabled={isGuest}>
                    <SidebarMenuButton className="h-fit">
                      <Avatar className="mr-1 border-2 border-primary/20 hover:border-primary/40 transition-all duration-200">
                        <AvatarImage src={userData.avatar ? `http://localhost:5039/uploads/avatars/${userData.avatar}` : undefined} />
                        <AvatarFallback>{`${userData.firstName[0]}${userData.lastName[0]}`}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="truncate font-semibold">{`${userData.firstName} ${userData.lastName}`}</div>
                        <div className="truncate text-xs">{userData.email}</div>
                      </div>
                      <ChevronsUpDown className="ml-auto" />
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent side="right" className="w-[--radix-popper-anchor-width] mb-2">
                    <DropdownMenuItem onClick={() => routeTo('/settings')}>
                      <Settings />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => routeTo('/settings/account')}>
                      <User />
                      <span>Account</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={signout}>
                      <LogOut />
                      <span>Sign out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ))}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}