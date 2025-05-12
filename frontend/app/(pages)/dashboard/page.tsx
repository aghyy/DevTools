"use client"

import React, { useState, useEffect } from "react";
import { TopSpacing } from "@/components/top-spacing";
import { useRouter } from "next/navigation";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"

import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";

import { 
  Clock, 
  Hammer, 
  Book, 
  Library, 
  GraduationCap,
  Code,
  Binary,
  Hash,
  Link as LinkIcon,
  Regex,
  Activity
} from "lucide-react";

import { getUser } from "@/services/auth";
import { 
  getRecentActivities, 
  getMostUsedItems,
  Activity as ActivityType,
  MostUsedItem
} from "@/services/activity";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

// Interface for user data
interface UserData {
  id?: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
}

// Icon mapping
const iconMap: Record<string, React.ElementType> = {
  'Hammer': Hammer,
  'Book': Book,
  'Library': Library,
  'GraduationCap': GraduationCap,
  'Code': Code,
  'Binary': Binary,
  'Hash': Hash,
  'Link': LinkIcon,
  'Regex': Regex,
  'Activity': Activity
};

export default function Dashboard() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentItems, setRecentItems] = useState<ActivityType[]>([]);
  const [mostUsedItems, setMostUsedItems] = useState<MostUsedItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Featured links with better icons
  const featuredLinks = [
    {
      name: "Tools",
      href: "/tools",
      icon: Hammer,
      description: "Use our suite of developer tools"
    },
    {
      name: "Documentation",
      href: "/docs",
      icon: Book,
      description: "Browse through detailed documentation"
    },
    {
      name: "Knowledge Base",
      href: "/knowledge-base",
      icon: GraduationCap,
      description: "Access shared knowledge resources"
    },
    {
      name: "Libraries",
      href: "/libraries",
      icon: Library,
      description: "Explore our code libraries"
    }
  ];

  const router = useRouter();

  // Fetch user data and activities
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get user data
        const user = await getUser();
        setUserData(user);
        
        // Get recent activities
        const activities = await getRecentActivities(4);
        setRecentItems(activities);
        
        // Get most used items
        const mostUsed = await getMostUsedItems(4);
        setMostUsedItems(mostUsed);
        
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError("Failed to load dashboard data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const routeTo = (path: string) => {
    router.push(path);
  }

  // Format relative time
  const formatRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffDay > 0) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
    if (diffHour > 0) return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
    if (diffMin > 0) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
    return 'just now';
  };

  // Get the appropriate icon component
  const getIconComponent = (iconName: string): React.ElementType => {
    return iconMap[iconName] || Activity;
  };

  return (
    <div className="h-full w-full">
      <div className="relative size-0">
        <Breadcrumb className="absolute z-50 left-20 top-[22px] w-max">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Dashboard</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <TopSpacing />
      
      <div className="w-full px-8 pt-8 pb-24 mx-auto">
        {/* User welcome section */}
        <div className="mb-8">
          <Card className="bg-primary/5 border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                  {loading ? (
                    <Skeleton className="h-16 w-16 rounded-full" />
                  ) : (
                    <Avatar className="h-16 w-16 border-4 border-white/20">
                      <AvatarImage src={userData?.id ? `/images/avatar/${userData.id}.png` : undefined} />
                      <AvatarFallback className="bg-primary/5 text-lg">
                        {userData?.firstName?.charAt(0)}{userData?.lastName?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div>
                    {loading ? (
                      <>
                        <Skeleton className="h-8 w-48 mb-2" />
                        <Skeleton className="h-4 w-32" />
                      </>
                    ) : (
                      <>
                        <h2 className="text-2xl font-bold">Welcome, {userData?.firstName || 'User'}</h2>
                        <p className="text-primary/50">@{userData?.username || 'username'}</p>
                      </>
                    )}
                  </div>
                </div>
                <div className="bg-primary/5 rounded-lg p-4 backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-emerald-400" />
                    <span className="text-sm text-emerald-400 font-medium">Active Session</span>
                  </div>
                  <p className="text-xs text-primary/50 mt-1">Last login: {new Date().toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg text-red-500">
            {error}
          </div>
        )}
        
        {/* Recent activity section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5" /> 
            Recent Activity
          </h2>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-24 w-full rounded-lg" />
              ))}
            </div>
          ) : recentItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentItems.map((item) => {
                const IconComponent = getIconComponent(item.icon);
                return (
                  <Card 
                    key={item.id} 
                    className="cursor-pointer hover:bg-primary/5 transition-colors"
                    onClick={() => routeTo(item.path)}
                  >
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="bg-primary/5 p-3 rounded-full">
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{item.name}</h3>
                        <div className="flex items-center text-xs text-primary/50">
                          <Clock className="h-3 w-3 mr-1" />
                          {item.createdAt ? formatRelativeTime(item.createdAt) : 'Recently'}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center border rounded-lg bg-slate-50 dark:bg-slate-900/20">
              <p className="text-slate-500">No activity recorded yet. Start using tools and resources!</p>
            </div>
          )}
        </div>
        
        {/* Most used items section */}
        {!loading && mostUsedItems.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5" /> 
              Most Used
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mostUsedItems.map((item, idx) => {
                const IconComponent = getIconComponent(item.icon);
                // Ensure count is a number
                const count = typeof item.count === 'number' ? item.count : parseInt(String(item.count), 10) || 0;
                return (
                  <Card 
                    key={idx} 
                    className="cursor-pointer hover:bg-primary/5 transition-colors"
                    onClick={() => routeTo(item.path)}
                  >
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="bg-primary/5 p-3 rounded-full">
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div className="flex flex-col flex-1 gap-1">
                        <h3 className="font-medium">{item.name}</h3>
                        <div className="flex items-center text-xs text-primary/50">
                          <span className="px-2 py-0.5 bg-primary/5 rounded-full text-xs">
                            Used {count} time{count !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Featured links - now as improved cards */}
        <h2 className="text-xl font-semibold mb-4">Quick Access</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {featuredLinks.map((link, index) => (
            <Card 
              key={index} 
              className="cursor-pointer overflow-hidden hover:shadow-md transition-all duration-300"
              onClick={() => routeTo(link.href)}
            >
              <CardHeader className="p-4 pb-0">
                <div className="p-2 bg-primary/5 rounded-full w-fit">
                  <link.icon className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <CardTitle className="text-lg">{link.name}</CardTitle>
                <CardDescription className="mt-1">{link.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
