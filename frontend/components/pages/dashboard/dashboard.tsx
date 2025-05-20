"use client"

import React, { useState, useEffect } from "react";
import { TopSpacing } from "@/components/top-spacing";
import { useAtom } from "jotai";
import { userDataAtom } from "@/atoms/auth";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"

import {
  Heart,
  Clock3,
  Activity,
} from "lucide-react";

import {
  getRecentActivities,
  getMostUsedItems,
  Activity as ActivityType,
  MostUsedItem
} from "@/services/activity";

import UserWelcome from "@/components/pages/dashboard/user-welcome";
import ChartSection from "@/components/pages/dashboard/charts/chart-section";
import RecentActivities from "@/components/pages/dashboard/recent-activities";
import MostUsed from "@/components/pages/dashboard/most-used";
import DashboardFavorites from "@/components/pages/dashboard/favorites-section";
import FeaturedSection from "@/components/pages/dashboard/featured-section";

export default function Dashboard() {
  const [userData] = useAtom(userDataAtom);
  const [loading, setLoading] = useState(true);
  const [recentItems, setRecentItems] = useState<ActivityType[]>([]);
  const [mostUsedItems, setMostUsedItems] = useState<MostUsedItem[]>([]);
  const [error, setError] = useState<string | null>(null);

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

  // Get the usage statistics
  const performanceStats = getPerformanceStats();

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

      <div className="w-full px-4 md:px-8 pt-6 md:pt-8 pb-8 mx-auto">
        <UserWelcome userData={userData} loading={loading} />

        {error && (
          <div className="mb-6 md:mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        <ChartSection loading={loading} recentItems={recentItems} performanceStats={performanceStats} mostUsedItems={mostUsedItems} />

        {/* Recent Activity */}
        <div className="mb-6 md:mb-8">
          <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 flex items-center gap-2">
            <Clock3 className="h-4 w-4 md:h-5 md:w-5" />
            Recent Activity
          </h2>
          <RecentActivities loading={loading} recentItems={recentItems} />
        </div>

        {/* Most Used */}
        <div className="mb-6 md:mb-8">
          <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 flex items-center gap-2">
            <Activity className="h-4 w-4 md:h-5 md:w-5" />
            Most Used
          </h2>
          <MostUsed loading={loading} mostUsedItems={mostUsedItems} />
        </div>

        {/* Favorites section */}
        <div className="mb-6 md:mb-8">
          <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 flex items-center gap-2">
            <Heart className="h-4 w-4 md:h-5 md:w-5" />
            Favorite Tools
          </h2>
          <DashboardFavorites />
        </div>

        {/* Featured links */}
        <div>
          <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">Quick Access</h2>
          <FeaturedSection />
        </div>
      </div>
    </div>
  );
}
