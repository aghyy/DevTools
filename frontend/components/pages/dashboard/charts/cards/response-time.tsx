import { XAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip, YAxis, LineChart as RechartsLineChart, Line } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import StatCard from "../stat-card";
import { useTheme } from "next-themes";
import { PerformanceStats } from "@/types/charts";
import CustomTooltip from "../tooltip";
import { useThemeColors, useTooltipStyle } from "@/hooks/charts";
import { Timer } from "lucide-react";

export default function ResponseTimeCard({ loading, performanceStats, description }: {
  loading: boolean;
  performanceStats: PerformanceStats;
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
          title="Average Response Time"
          value={performanceStats.current}
          suffix="ms"
          change={performanceStats.change}
          icon={<Timer className="h-4 w-4 text-indigo-500" />}
          description={description}
        >
          <ResponsiveContainer width="100%" height="100%">
            <RechartsLineChart
              data={performanceStats.data}
              margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
            >
              {renderYAxis("response")}
              <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.1} stroke={themeColors.chartColors.response.grid} />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: themeColors.textMuted, fontSize: 10 }}
                dy={5}
              />
              <RechartsTooltip
                content={<CustomTooltip style={tooltipStyle} />}
                cursor={{ stroke: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }}
              />
              <Line
                type="monotone"
                name="Response Time"
                unit=" ms"
                dataKey="value"
                stroke={themeColors.chartColors.response.line}
                strokeWidth={2}
                dot={{ r: 3, fill: themeColors.chartColors.response.line, stroke: themeColors.chartColors.response.line }}
                activeDot={{ r: 5, fill: themeColors.chartColors.response.line, stroke: themeColors.chartColors.response.line }}
                animationDuration={1500}
              />
            </RechartsLineChart>
          </ResponsiveContainer>
        </StatCard>
      )}
    </>)
}