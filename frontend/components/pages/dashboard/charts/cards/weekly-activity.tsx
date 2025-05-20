import { XAxis, BarChart, CartesianGrid, Bar, ResponsiveContainer, Tooltip as RechartsTooltip, YAxis } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import StatCard from "../stat-card";
import { BarChart4 } from "lucide-react";
import { useTheme } from "next-themes";
import { ActivityTrend } from "@/types/charts";
import CustomTooltip from "../tooltip";
import { useThemeColors, useTooltipStyle } from "@/hooks/charts";

export default function WeeklyActivityCard({ loading, activityTrend, description }: {
  loading: boolean;
  activityTrend: ActivityTrend;
  description: string;
}) {
  const { theme, systemTheme } = useTheme();
  const resolvedTheme = theme === 'system' ? systemTheme : theme;
  const isDark = resolvedTheme === 'dark';
  const themeColors = useThemeColors();
  const tooltipStyle = useTooltipStyle();

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
            <BarChart
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
                content={<CustomTooltip style={tooltipStyle} />}
                cursor={{ fill: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' }}
              />
              <Bar
                name="Activities"
                dataKey="value"
                fill={themeColors.chartColors.activity.bar}
                radius={[4, 4, 0, 0]}
                animationDuration={1500}
              />
            </BarChart>
          </ResponsiveContainer>
        </StatCard>
      )}
    </>)
}