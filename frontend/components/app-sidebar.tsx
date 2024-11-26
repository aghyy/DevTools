"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter, SidebarMenuSub, SidebarMenuSubItem, SidebarHeader } from "@/components/ui/sidebar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Icon from "@/components/icon"
import { Home, Library, GraduationCap, Book, Code, Hammer, Binary, Hash, Settings, CircleUserRound, ChevronsUpDown, ChevronDown, ChevronRight, LogOut } from "lucide-react"
import { IoLockClosedOutline } from "react-icons/io5";
import { logout as authLogout, getUser } from "@/services/auth"

const sidebarItems = {
  general: [
    { title: "Dashboard", url: "/dashboard", icon: Home },
    { title: "Libraries", url: "/libraries", icon: Library },
    { title: "Knowledge Base", url: "/knowledge-base", icon: GraduationCap },
    { title: "Docs", url: "/docs", icon: Book },
    { title: "Code Snippets", url: "/code-snippets", icon: Code },
  ],
  tools: {
    title: "Tools", icon: Hammer, items: [
      { title: "Base64", url: "/tools/base64", icon: Binary },
      { title: "MD5 Hash", url: "/tools/md5", icon: Hash },
      { title: "SHA1 Hash", url: "/tools/sha1", icon: Hash },
      { title: "Steganography", url: "/tools/steganography", icon: IoLockClosedOutline },
    ]
  },
}

const renderIcon = (icon: string | React.ComponentType<any>) => {
  if (typeof icon === 'string') {
    return <Icon src={icon} />
  }

  return React.createElement(icon)
}

export function AppSidebar() {
  const [openStates, setOpenStates] = useState({
    codeSnippets: false,
    tools: true,
  })

  const [userData, setUserData] = useState({ username: "", firstName: "", lastName: "", email: "", avatar: "" })
  const router = useRouter()

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = await getUser()
        if (user) {
          setUserData({
            username: user.username || "Guest",
            firstName: user.firstName || "User",
            lastName: user.lastName || "User",
            email: user.email || "N/A",
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

  const routeToSettings = () => {
    router.push("/settings")
  }

  const routeToAccount = () => {
    router.push("/settings/account")
  }

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center justify-center p-3">
          <div className="size-10 absolute left-3 pointer-events-none">
            <img src="/images/icons/devtools-dark.png" alt="DevTools Logo" />
          </div>
          <div className="font-semibold">DevTools</div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>General</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {sidebarItems.general.map(({ title, url, icon }) => (
                <SidebarMenuItem key={title}>
                  <SidebarMenuButton asChild>
                    <a href={url}>
                      {renderIcon(icon)}
                      <span>{title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              {Object.entries({ tools: sidebarItems.tools }).map(([key, { title, icon, items }]) => (
                <SidebarMenu key={key}>
                  <Collapsible open={openStates[key as keyof typeof openStates]} onOpenChange={() => toggleCollapse(key as keyof typeof openStates)} className="group/collapsible">
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton asChild>
                          <a href="#">
                            {renderIcon(icon)}
                            <span>{title}</span>
                            {openStates[key as keyof typeof openStates] ? <ChevronDown className="ml-auto" /> : <ChevronRight className="ml-auto" />}
                          </a>
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {items.map(({ title, url, icon }) => (
                            <SidebarMenuSubItem key={title}>
                              <SidebarMenuButton asChild>
                                <a href={url}>
                                  {renderIcon(icon)}
                                  <span>{title}</span>
                                </a>
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
                <DropdownMenuItem onClick={routeToSettings}>
                  <Settings />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={routeToAccount}>
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