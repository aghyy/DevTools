"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter, SidebarMenuSub, SidebarMenuSubItem, SidebarHeader } from "@/components/ui/sidebar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Icon from "@/components/icon"
import { Settings, ChevronsUpDown, ChevronDown, ChevronRight, LogOut, Heart, LogIn } from "lucide-react"
import { logout as authLogout, getUserDetails } from "@/services/auth"
import { sidebarItems } from "@/utils/tools"
import { useFavoriteTools } from "@/hooks/useFavoriteTools"
import { getIconComponent } from "@/utils/icons"
import { IoEye, IoPencil } from "react-icons/io5"
import { useAtom } from "jotai"
import { isGuestAtom, initializeGuestStateAtom } from "@/atoms/auth"
import { UserData } from "@/types/user"

export function AppSidebar() {
  const [isGuest, setIsGuest] = useAtom(isGuestAtom);
  const [isLoading, setIsLoading] = useState(true);

  const [openStates, setOpenStates] = useState({
    codeSnippets: false,
    tools: true,
    favorites: !isGuest,
  })

  useEffect(() => {
    setOpenStates(prev => ({
      ...prev,
      favorites: !isGuest
    }));
  }, [isGuest]);

  const [, initializeGuestState] = useAtom(initializeGuestStateAtom);
  const router = useRouter()
  const [userData, setUserData] = useState<UserData | null>(null);
  const { favorites, loading } = useFavoriteTools()

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = await getUserDetails();
        setUserData(user);
      } catch (error) {
        console.log("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    initializeGuestState();
    fetchUserData();
  }, [initializeGuestState])

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
  }

  const toggleCollapse = (key: keyof typeof openStates) => {
    setOpenStates(prev => ({ ...prev, [key]: !prev[key] }));
  }

  const routeTo = (path: string) => {
    router.push(path);
  }

  // Filter out the favorites item from general items
  const generalItems = sidebarItems.general.filter(item => item.title !== "Favorites");

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
                          favorites.map((favorite) => (
                            <SidebarMenuSubItem key={favorite.id}>
                              <SidebarMenuButton asChild>
                                <div className="cursor-default" onClick={() => routeTo(favorite.toolUrl)}>
                                  {favorite.icon ? (
                                    <Icon icon={getIconComponent(favorite.icon)} />
                                  ) : (
                                    <Heart className="h-4 w-4 mr-2 text-muted-foreground" />
                                  )}
                                  <span>{favorite.toolName}</span>
                                </div>
                              </SidebarMenuButton>
                            </SidebarMenuSubItem>
                          ))
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
            {isLoading ? (
              <SidebarMenuButton className="h-fit">
                <div className="animate-pulse flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-full bg-muted"></div>
                  <div className="h-4 w-24 bg-muted rounded"></div>
                </div>
              </SidebarMenuButton>
            ) : isGuest ? (
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
                      <Avatar className="mr-1">
                        <AvatarImage src={userData.avatar} />
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