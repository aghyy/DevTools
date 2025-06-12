"use client"

import React, { useState, useEffect } from "react";
import { TopSpacing } from "@/components/top-spacing";
import { useAtom } from "jotai";
import { userDataAtom } from "@/atoms/auth";
import { motion } from "framer-motion";

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
  BarChart4,
  LayoutDashboard,
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
import { toast } from "sonner";
import WidgetSystem from "@/components/widgets/WidgetSystem";

const pageVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.5,
      when: "beforeChildren",
      staggerChildren: 0.1
    }
  }
};

const sectionVariants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      when: "beforeChildren",
      staggerChildren: 0.1
    }
  }
};

const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  }
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 10,
    scale: 0.98
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

export default function Dashboard() {
  const [userData] = useAtom(userDataAtom);
  const [loading, setLoading] = useState(true);
  const [recentItems, setRecentItems] = useState<ActivityType[]>([]);
  const [mostUsedItems, setMostUsedItems] = useState<MostUsedItem[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Get recent activities
        const activities = await getRecentActivities();
        setRecentItems(activities);

        // Get most used items
        const mostUsed = await getMostUsedItems(10);
        setMostUsedItems(mostUsed);

      } catch {
        toast.error("Failed to load dashboard data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <motion.div
      className="h-full w-full"
      initial="initial"
      animate="animate"
      variants={pageVariants}
    >
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
        {/* User Welcome */}
        <motion.div
          variants={sectionVariants}
          initial="initial"
          animate="animate"
        >
          <UserWelcome userData={userData} loading={loading} />
        </motion.div>

        {/* Widget System */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="mb-6 md:mb-8"
        >
          <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4 md:h-5 md:w-5" />
            System Widgets
          </h2>
          <WidgetSystem />
        </motion.div>

        {/* Charts */}
        <motion.div
          variants={sectionVariants}
          initial="initial"
          animate="animate"
        >
          <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 flex items-center gap-2">
            <BarChart4 className="h-4 w-4 md:h-5 md:w-5" />
            Activity Overview
          </h2>
          <ChartSection loading={loading} mostUsedItems={mostUsedItems} />
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          variants={sectionVariants}
          initial="initial"
          animate="animate"
          className="mb-6 md:mb-8"
        >
          <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 flex items-center gap-2">
            <Clock3 className="h-4 w-4 md:h-5 md:w-5" />
            Recent Activity
          </h2>
          <motion.div variants={cardVariants}>
            <RecentActivities loading={loading} recentItems={recentItems} />
          </motion.div>
        </motion.div>

        {/* Most Used */}
        <motion.div
          variants={sectionVariants}
          initial="initial"
          animate="animate"
          className="mb-6 md:mb-8"
        >
          <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 flex items-center gap-2">
            <Activity className="h-4 w-4 md:h-5 md:w-5" />
            Most Used
          </h2>
          <motion.div variants={cardVariants}>
            <MostUsed loading={loading} mostUsedItems={mostUsedItems} />
          </motion.div>
        </motion.div>

        {/* Favorites section */}
        <motion.div
          variants={sectionVariants}
          initial="initial"
          animate="animate"
          className="mb-6 md:mb-8"
        >
          <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 flex items-center gap-2">
            <Heart className="h-4 w-4 md:h-5 md:w-5" />
            Favorite Tools
          </h2>
          <motion.div variants={cardVariants}>
            <DashboardFavorites />
          </motion.div>
        </motion.div>

        {/* Featured links */}
        <motion.div
          variants={sectionVariants}
          initial="initial"
          animate="animate"
        >
          <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">Quick Access</h2>
          <motion.div variants={cardVariants}>
            <FeaturedSection loading={loading} />
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
