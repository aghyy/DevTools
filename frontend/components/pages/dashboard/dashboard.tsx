"use client"

import React, { useState, useEffect } from "react";
import { TopSpacing } from "@/components/top-spacing";
import { useRouter } from "next/navigation";
import { useAtom } from "jotai";
import { userDataAtom } from "@/atoms/auth";
import { useTheme } from "next-themes";

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
  Activity,
  Heart,
  Code,
  Clock3,
} from "lucide-react";

import {
  getRecentActivities,
  getMostUsedItems,
  Activity as ActivityType,
  MostUsedItem
} from "@/services/activity";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { MagicCard } from "@/components/ui/magic-card";
import DashboardFavorites from "@/components/dashboard-favorites";
import { getIconComponent } from "@/utils/icons";
import { cn } from "@/lib/utils";
import WeeklyActivityCard from "./charts/cards/weekly-activity";
import ResponseTimeCard from "./charts/cards/response-time";
import ActiveSessionsCard from "./charts/cards/active-sessions";
import RessourceUsageCard from "./charts/cards/ressource-usage";

export default function Dashboard() {
  const [userData] = useAtom(userDataAtom);
  const [loading, setLoading] = useState(true);
  const [recentItems, setRecentItems] = useState<ActivityType[]>([]);
  const [mostUsedItems, setMostUsedItems] = useState<MostUsedItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { theme, systemTheme } = useTheme();

  // Theme-aware colors - properly handling system theme
  const resolvedTheme = theme === 'system' ? systemTheme : theme;
  const isDark = resolvedTheme === 'dark';

  // Chart descriptions for the info tooltips
  const chartDescriptions = {
    weeklyActivity: "Shows your activity counts for each day of the past week. Higher bars indicate more activity on those days.",
    responseTime: "Shows the average response time of tools over time. Lower values indicate better performance.",
    activeSessions: "Compares the number of active sessions in the current period (orange) with the previous period (light orange).",
    resourceUsage: "A breakdown of your most used resources. Hover over each segment to see specific usage counts."
  };

  // Featured links with better icons
  const featuredLinks = [
    {
      name: "Tools",
      href: "/tools",
      icon: Hammer,
      description: "Use our suite of developer tools"
    },
    {
      name: "Bookmarks",
      href: "/bookmarks",
      icon: Book,
      description: "Browse through your bookmarks"
    },
    {
      name: "Code Snippets",
      href: "/code-snippets",
      icon: Code,
      description: "Browse through your code snippets"
    }
  ];

  const router = useRouter();

  // Fetch activities
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Get recent activities
        const activities = await getRecentActivities(20); // Fetch more activities for better stats
        setRecentItems(activities);

        // Get most used items
        const mostUsed = await getMostUsedItems(10); // Fetch more items for better stats
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

  // Process activity data for timeline chart
  const processActivityTimeline = (activities: ActivityType[]) => {
    if (!activities.length) return [];

    // Create a map to count activities by day
    const dayCount = new Map<string, number>();

    // Get activities of the last 7 days
    const last7Days: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStr = date.toLocaleDateString('en-US', { weekday: 'short' });
      last7Days.push(dayStr);
      // Initialize with zero count
      dayCount.set(dayStr, 0);
    }

    // Count activities by day
    activities.forEach(activity => {
      if (activity.createdAt) {
        const date = new Date(activity.createdAt);
        const dayStr = date.toLocaleDateString('en-US', { weekday: 'short' });
        if (dayCount.has(dayStr)) {
          dayCount.set(dayStr, (dayCount.get(dayStr) || 0) + 1);
        }
      }
    });

    // Convert to array format needed by Recharts
    return last7Days.map(day => ({
      name: day,
      value: dayCount.get(day) || 0
    }));
  };

  // Get total activity count for last 7 days vs previous 7 days
  const getActivityTrend = () => {
    if (!recentItems.length) return { current: 0, change: 0, data: [] };

    const now = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(now.getDate() - 7);

    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(now.getDate() - 14);

    // Filter activities for current week
    const currentWeekActivities = recentItems.filter(activity => {
      if (!activity.createdAt) return false;
      const date = new Date(activity.createdAt);
      return date >= oneWeekAgo && date <= now;
    });

    // Filter activities for previous week
    const previousWeekActivities = recentItems.filter(activity => {
      if (!activity.createdAt) return false;
      const date = new Date(activity.createdAt);
      return date >= twoWeeksAgo && date < oneWeekAgo;
    });

    // Calculate current week total
    const currentWeekCount = currentWeekActivities.length;

    // Calculate previous week total
    const previousWeekCount = previousWeekActivities.length;

    // Calculate percentage change
    const change = previousWeekCount === 0
      ? 100
      : ((currentWeekCount - previousWeekCount) / previousWeekCount) * 100;

    return {
      current: currentWeekCount,
      change,
      data: processActivityTimeline(recentItems)
    };
  };

  // Get resource usage stats from most used items
  const getResourceUsageStats = () => {
    if (!mostUsedItems.length) return { totalUsage: 0, data: [] };

    // Convert most used items to data points
    const data = mostUsedItems.slice(0, 8).map(item => ({
      name: item.name,
      value: typeof item.count === 'number' ? item.count : parseInt(String(item.count), 10) || 1
    }));

    // Calculate total usage
    const totalUsage = data.reduce((sum, item) => sum + item.value, 0);

    return {
      data,
      totalUsage
    };
  };

  // Generate average response time data (simulated for demo)
  const getPerformanceStats = () => {
    // Simulate average response time for the last 7 days
    const days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    });

    // Simulate downward trend (improving response times)
    const baseResponseTime = 350; // ms
    const data = days.map((day, index) => ({
      name: day,
      value: parseFloat((Math.max(120, baseResponseTime - (index * 30) + (Math.random() * 40 - 20))).toFixed(2))
    }));

    // Calculate current and previous period averages
    const currentPeriod = data.slice(3).map(d => d.value);
    const previousPeriod = data.slice(0, 3).map(d => d.value);

    const currentAvg = currentPeriod.reduce((sum, val) => sum + val, 0) / currentPeriod.length;
    const previousAvg = previousPeriod.reduce((sum, val) => sum + val, 0) / previousPeriod.length;

    // Calculate percentage change (negative is good for response time)
    const change = ((currentAvg - previousAvg) / previousAvg) * 100;

    return {
      current: parseFloat(currentAvg.toFixed(2)),
      change,
      data
    };
  };

  // Get active sessions data (simulated for demo)
  const getActiveSessionsStats = () => {
    // Generate data for current week
    const days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    });

    // Current week data with realistic pattern (higher on weekdays)
    const generateSessionData = (day: string, index: number, baseline: number) => {
      // Weekend effect (sat/sun)
      const isWeekend = index === 0 || index === 6;
      const weekendFactor = isWeekend ? 0.6 : 1;

      // Random variation
      const variation = Math.random() * 5 - 2.5;

      return Math.round((baseline + variation) * weekendFactor);
    };

    // Generate current week data and reference data
    const data = days.map((day, index) => ({
      name: day,
      current: generateSessionData(day, index, 12),
      previous: generateSessionData(day, index, 10)
    }));

    // Calculate averages
    const currentAvg = data.reduce((sum, item) => sum + item.current, 0) / data.length;
    const previousAvg = data.reduce((sum, item) => sum + item.previous, 0) / data.length;

    // Calculate percentage change
    const change = ((currentAvg - previousAvg) / previousAvg) * 100;

    return {
      current: Math.round(currentAvg),
      change,
      data
    };
  };

  // Get the usage statistics
  const activityTrend = getActivityTrend();
  const resourceUsageStats = getResourceUsageStats();
  const performanceStats = getPerformanceStats();
  const sessionsStats = getActiveSessionsStats();

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

      <div className="w-full px-4 md:px-8 pt-6 md:pt-8 pb-24 mx-auto">
        {/* User welcome section */}
        <div className="mb-6 md:mb-8">
          <Card className={cn(
            "border-0 shadow-lg",
            isDark ? "bg-primary/5" : "bg-primary/5"
          )}>
            <CardContent className="p-4 md:p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                  {loading ? (
                    <Skeleton className="h-12 w-12 md:h-16 md:w-16 rounded-full" />
                  ) : (
                    <Avatar className="h-12 w-12 md:h-16 md:w-16 border-4 border-primary/20 hover:border-primary/40 transition-all duration-200">
                      <AvatarImage src={userData?.avatar ? `${process.env.NEXT_PUBLIC_API_URL}/uploads/avatars/${userData.avatar}` : undefined} />
                      <AvatarFallback className="bg-primary/5 text-base md:text-lg">
                        {userData?.firstName?.charAt(0)}{userData?.lastName?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div>
                    {loading ? (
                      <>
                        <Skeleton className="h-7 w-36 md:h-8 md:w-48 mb-2" />
                        <Skeleton className="h-4 w-24 md:w-32" />
                      </>
                    ) : (
                      <>
                        <h2 className="text-xl md:text-2xl font-bold">Welcome, {userData?.firstName || 'User'}</h2>
                        <p className="text-primary/50">@{userData?.username || 'username'}</p>
                      </>
                    )}
                  </div>
                </div>
                <div className="bg-primary/5 rounded-lg p-3 md:p-4 backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 md:h-5 md:w-5 text-emerald-400" />
                    <span className="text-xs md:text-sm text-emerald-400 font-medium">Active Session</span>
                  </div>
                  <p className="text-xs text-primary/50 mt-1">Last login: {new Date().toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {error && (
          <div className="mb-6 md:mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Stats Cards Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          <WeeklyActivityCard loading={loading} activityTrend={activityTrend} description={chartDescriptions.weeklyActivity} />
          <ResponseTimeCard loading={loading} performanceStats={performanceStats} description={chartDescriptions.responseTime} />
          <ActiveSessionsCard loading={loading} sessionsStats={sessionsStats} description={chartDescriptions.activeSessions} />
          <RessourceUsageCard loading={loading} resourceUsageStats={resourceUsageStats} description={chartDescriptions.resourceUsage} />
        </div>

        {/* Recent activity section */}
        <div className="mb-6 md:mb-8">
          <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 flex items-center gap-2">
            <Clock3 className="h-4 w-4 md:h-5 md:w-5" />
            Recent Activity
          </h2>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-20 md:h-24 w-full rounded-lg" />
              ))}
            </div>
          ) : recentItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {recentItems.slice(0, 6).map((item) => {
                const IconComponent = getIconComponent(item.icon);
                return (
                  <MagicCard
                    key={item.id}
                    className="overflow-hidden cursor-pointer"
                    onClick={() => routeTo(item.path)}
                  >
                    <Card className="h-full border-0 bg-transparent">
                      <CardContent className="p-3 md:p-4 flex items-center gap-3 md:gap-4">
                        <div className={cn(
                          "p-2 md:p-3 rounded-full",
                          isDark ? "bg-primary/10" : "bg-primary/5"
                        )}>
                          <IconComponent className="h-4 w-4 md:h-5 md:w-5" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium">{item.name}</h3>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Clock className="h-3 w-3 mr-1" />
                            {item.createdAt ? formatRelativeTime(item.createdAt) : 'Recently'}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </MagicCard>
                );
              })}
            </div>
          ) : (
            <div className="p-6 md:p-8 text-center border rounded-lg bg-slate-50 dark:bg-slate-900/20">
              <p className="text-slate-500">No activity recorded yet. Start using tools and resources!</p>
            </div>
          )}
        </div>

        {/* Most used items section */}
        {!loading && mostUsedItems.length > 0 && (
          <div className="mb-6 md:mb-8">
            <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 flex items-center gap-2">
              <Activity className="h-4 w-4 md:h-5 md:w-5" />
              Most Used
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {mostUsedItems.slice(0, 6).map((item, idx) => {
                const IconComponent = getIconComponent(item.icon);
                // Ensure count is a number
                const count = typeof item.count === 'number' ? item.count : parseInt(String(item.count), 10) || 0;
                return (
                  <MagicCard
                    key={idx}
                    className="overflow-hidden cursor-pointer"
                    onClick={() => routeTo(item.path)}
                  >
                    <Card className="h-full border-0 bg-transparent">
                      <CardContent className="p-3 md:p-4 flex items-center gap-3 md:gap-4">
                        <div className={cn(
                          "p-2 md:p-3 rounded-full",
                          isDark ? "bg-primary/10" : "bg-primary/5"
                        )}>
                          <IconComponent className="h-4 w-4 md:h-5 md:w-5" />
                        </div>
                        <div className="flex flex-col flex-1 gap-1">
                          <h3 className="font-medium">{item.name}</h3>
                          <div className="flex items-center text-xs">
                            <span className={cn(
                              "px-2 py-0.5 rounded-full text-xs",
                              isDark ? "bg-primary/10 text-muted-foreground" : "bg-primary/5 text-muted-foreground"
                            )}>
                              Used {count} time{count !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </MagicCard>
                );
              })}
            </div>
          </div>
        )}

        {/* Favorites section */}
        <div className="mb-6 md:mb-8">
          <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 flex items-center gap-2">
            <Heart className="h-4 w-4 md:h-5 md:w-5" />
            Favorite Tools
          </h2>
          <DashboardFavorites />
        </div>

        {/* Featured links - now as improved cards */}
        <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">Quick Access</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
          {featuredLinks.map((link, index) => (
            <MagicCard
              key={index}
              className="overflow-hidden cursor-pointer h-[160px] md:h-[180px]"
              onClick={() => routeTo(link.href)}
            >
              <Card className="h-full border-0 bg-transparent">
                <CardHeader className="p-3 md:p-4 pb-0">
                  <div
                    className={cn(
                      "p-1.5 md:p-2 rounded-full w-fit",
                      isDark ? "bg-primary/10" : "bg-primary/5"
                    )}
                    suppressHydrationWarning
                  >
                    <link.icon className="h-4 w-4 md:h-5 md:w-5" />
                  </div>
                </CardHeader>
                <CardContent className="p-3 md:p-4">
                  <CardTitle className="text-base md:text-lg">{link.name}</CardTitle>
                  <CardDescription className="mt-1 text-xs md:text-sm">{link.description}</CardDescription>
                </CardContent>
              </Card>
            </MagicCard>
          ))}
        </div>
      </div>
    </div>
  );
}
