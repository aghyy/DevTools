import { XAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip, YAxis, LineChart as RechartsLineChart, Line } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import StatCard from "../stat-card";
import { BarChart4 } from "lucide-react";
import { useTheme } from "next-themes";
import CustomTooltip from "../tooltip";
import { useThemeColors } from "@/hooks/charts";
import { Activity as ActivityType } from "@/services/activity";
import { useEffect, useState } from "react";
import { ComparisonChartData } from "@/types/charts";

export default function WeeklyActivityCard({ loading, recentItems, description }: {
  loading: boolean;
  recentItems: ActivityType[];
  description: string;
}) {
  const { theme, systemTheme } = useTheme();
  const resolvedTheme = theme === 'system' ? systemTheme : theme;
  const isDark = resolvedTheme === 'dark';
  const themeColors = useThemeColors();

  const [activityTrend, setActivityTrend] = useState<ComparisonChartData>({ 
    current: 0, 
    change: 0, 
    data: [] 
  });

  const renderYAxis = (chart: string) => (
    <YAxis
      axisLine={false}
      tickLine={false}
      tick={{ fill: themeColors.textMuted, fontSize: 10 }}
      width={30} // Ensure there's enough space for the axis
      tickFormatter={(value) => chart === 'response' ? `${value.toFixed(0)}` : `${value}`}
      style={{ fontSize: '10px' }}
      domain={chart === 'activity' ? [0, 'dataMax + 2'] : ['dataMin - 5', 'dataMax + 5']}
    />
  );

  useEffect(() => {
    // Process activity data for timeline chart
    const processActivityTimeline = (activities: ActivityType[]) => {
      if (!activities.length) return [];

      const now = new Date();
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(now.getDate() - 7);
      
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(now.getDate() - 14);

      // Create maps to count activities by day for current and previous weeks
      const currentWeekDayCount = new Map<string, number>();
      const previousWeekDayCount = new Map<string, number>();

      // Initialize days of the week
      const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      
      // Initialize counters for both weeks
      weekdays.forEach(day => {
        currentWeekDayCount.set(day, 0);
        previousWeekDayCount.set(day, 0);
      });

      // Count activities by day for both current and previous weeks
      activities.forEach(activity => {
        if (activity.createdAt) {
          const date = new Date(activity.createdAt);
          const dayStr = date.toLocaleDateString('en-US', { weekday: 'short' });
          
          if (date >= oneWeekAgo && date <= now) {
            currentWeekDayCount.set(dayStr, (currentWeekDayCount.get(dayStr) || 0) + 1);
          } else if (date >= twoWeeksAgo && date < oneWeekAgo) {
            previousWeekDayCount.set(dayStr, (previousWeekDayCount.get(dayStr) || 0) + 1);
          }
        }
      });

      // Get the current day of the week
      const today = new Date().getDay();
      
      // Create ordered array of days starting from 7 days ago
      const orderedDays = Array(7).fill(0).map((_, i) => {
        const dayIndex = (today - 6 + i + 7) % 7;
        return weekdays[dayIndex];
      });

      // Convert to array format needed by Recharts
      return orderedDays.map(day => ({
        name: day,
        current: currentWeekDayCount.get(day) || 0,
        previous: previousWeekDayCount.get(day) || 0
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

    setActivityTrend(getActivityTrend());
  }, [recentItems]);

  return (
    <>
      {loading ? (
        <Skeleton className="h-[180px] md:h-[220px] w-full rounded-xl" />
      ) : (
        <StatCard
          title="Weekly Activity"
          value={activityTrend.current}
          change={activityTrend.change}
          icon={<BarChart4 className="h-4 w-4 text-emerald-500" />}
          description={description}
        >
          <ResponsiveContainer width="100%" height="100%">
            <RechartsLineChart
              data={activityTrend.data}
              margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
            >
              {renderYAxis("activity")}
              <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.1} stroke={themeColors.chartColors.activity.grid} />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: themeColors.textMuted, fontSize: 10 }}
                dy={5}
              />
              <RechartsTooltip
                content={<CustomTooltip />}
                cursor={{ stroke: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }}
              />
              <Line
                type="monotone"
                name="Previous"
                dataKey="previous"
                stroke={themeColors.chartColors.activity.previous}
                strokeWidth={1.5}
                dot={false}
                animationDuration={1200}
              />
              <Line
                type="monotone"
                name="Current"
                dataKey="current"
                stroke={themeColors.chartColors.activity.current}
                strokeWidth={2}
                dot={{ r: 3, fill: themeColors.chartColors.activity.current, stroke: themeColors.chartColors.activity.current }}
                activeDot={{ r: 5, fill: themeColors.chartColors.activity.current, stroke: themeColors.chartColors.activity.current }}
                animationDuration={1500}
              />
            </RechartsLineChart>
          </ResponsiveContainer>
        </StatCard>
      )}
    </>)
}