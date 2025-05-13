"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter, SidebarMenuSub, SidebarMenuSubItem, SidebarHeader } from "@/components/ui/sidebar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Icon from "@/components/icon"
import { Settings, CircleUserRound, ChevronsUpDown, ChevronDown, ChevronRight, LogOut, Heart, Plus } from "lucide-react"
import { logout as authLogout, getUser } from "@/services/auth"
import { sidebarItems } from "@/utils/tools"
import { useFavoriteTools } from "@/hooks/useFavoriteTools"
import { getIconComponent } from "@/utils/icons"

export function AppSidebar() {
  const [openStates, setOpenStates] = useState({
    codeSnippets: false,
    tools: true,
    favorites: true,
  })

  const router = useRouter()
  const [userData, setUserData] = useState({ username: "", firstName: "", lastName: "", email: "", avatar: "" })
  const { favorites, loading } = useFavoriteTools()

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = await getUser()
        if (user) {
          setUserData({
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            avatar: `/images/avatar/${user.id}.png`,
          })
        }
      } catch (error) {
        console.log("Error fetching user data:", error)
      }
    }

    fetchUserData()
  }, [])

  const signout = async () => {
    try {
      await authLogout()

      router.push("/auth/login")
    } catch (error) {
      console.log("Error signing out:", error)
    }
  }

  const toggleCollapse = (key: keyof typeof openStates) => {
    setOpenStates(prev => ({ ...prev, [key]: !prev[key] }))
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
                          <Heart className={`h-4 w-4 mr-2 ${favorites.length > 0 ? 'fill-red-500 text-red-500' : ''}`} />
                          <span>Favorites</span>
                          {openStates.favorites ? <ChevronDown className="ml-auto" /> : <ChevronRight className="ml-auto" />}
                        </div>
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {loading ? (
                          <SidebarMenuSubItem>
                            <SidebarMenuButton asChild>
                              <div className="cursor-default opacity-50">
                                <span>Loading...</span>
                              </div>
                            </SidebarMenuButton>
                          </SidebarMenuSubItem>
                        ) : favorites.length === 0 ? (
                          <SidebarMenuSubItem>
                            <SidebarMenuButton asChild>
                              <div className="cursor-default opacity-50">
                                <span>No favorites yet</span>
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
                        <SidebarMenuSubItem>
                          <SidebarMenuButton asChild>
                            <div className="cursor-default" onClick={() => routeTo('/favorites')}>
                              <Plus className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span>Manage Favorites</span>
                            </div>
                          </SidebarMenuButton>
                        </SidebarMenuSubItem>
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
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="h-fit">
                  <Avatar className="mr-1">
                    <AvatarImage src={userData.avatar} />
                    <AvatarFallback>{userData.firstName[0]}{userData.lastName[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="truncate font-semibold">{userData.firstName} {userData.lastName}</div>
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
                  <CircleUserRound />
                  <span>Account</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={signout}>
                  <LogOut />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}