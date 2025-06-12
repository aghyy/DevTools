import { XAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip, YAxis, LineChart as RechartsLineChart, Line } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import StatCard from "../stat-card";
import { BarChart4 } from "lucide-react";
import { useTheme } from "next-themes";
import CustomTooltip from "../tooltip";
import { useThemeColors } from "@/hooks/charts";
import { getWeeklyActivityData } from "@/services/activity";
import { useEffect, useState } from "react";
import { ComparisonChartData } from "@/types/charts";

export default function WeeklyActivityCard({ loading, description }: {
  loading: boolean;
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

  const renderYAxis = () => (
    <YAxis
      axisLine={false}
      tickLine={false}
      tick={{ fill: themeColors.textMuted, fontSize: 10 }}
      width={30}
      tickFormatter={(value) => Math.round(value).toString()}
      style={{ fontSize: '10px' }}
      domain={[0, 'dataMax + 1']}
    />
  );

    useEffect(() => {
    const fetchWeeklyData = async () => {
      if (!loading) {
        try {
          const data = await getWeeklyActivityData();
          setActivityTrend(data);
        } catch (error) {
          console.error('Error fetching weekly activity data:', error);
          // Set default empty data
          setActivityTrend({ current: 0, change: 0, data: [] });
        }
      }
    };

    fetchWeeklyData();
  }, [loading]);

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
              {renderYAxis()}
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
                name="Previous Week"
                dataKey="previous"
                stroke={themeColors.chartColors.activity.previous}
                strokeWidth={1.5}
                dot={false}
                animationDuration={1200}
              />
              <Line
                type="monotone"
                name="Current Week"
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