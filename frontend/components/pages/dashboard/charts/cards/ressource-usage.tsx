import { ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import StatCard from "../stat-card";
import { useThemeColors } from "@/hooks/charts";
import { BarChart4 } from "lucide-react";
import CustomTooltip from "../tooltip";
import { MostUsedItem } from "@/services/activity";
import { useState } from "react";
import { useEffect } from "react";
import { ResourceUsageStats } from "@/types/charts";
import { useTheme } from "next-themes";

export default function RessourceUsageCard({ loading, mostUsedItems, description }: {
  loading: boolean;
  mostUsedItems: MostUsedItem[];
  description: string;
}) {
  const themeColors = useThemeColors();
  const { theme, systemTheme } = useTheme();
  const resolvedTheme = theme === 'system' ? systemTheme : theme;
  const isDark = resolvedTheme === 'dark';
  const [resourceUsageStats, setResourceUsageStats] = useState<ResourceUsageStats>({ totalUsage: 0, data: [] });

  const renderYAxis = () => (
    <YAxis
      axisLine={false}
      tickLine={false}
      tick={{ fill: themeColors.textMuted, fontSize: 10 }}
      width={30}
      style={{ fontSize: '10px' }}
      domain={[0, 'dataMax + 2']}
    />
  );

  useEffect(() => {
    const getResourceUsageStats = () => {
      if (!mostUsedItems.length) return { totalUsage: 0, data: [] };

      const data = mostUsedItems.slice(0, 10).map(item => ({
        name: item.name,
        value: typeof item.count === 'number' ? item.count : parseInt(String(item.count), 10) || 1
      }));

      const totalUsage = data.reduce((sum, item) => sum + item.value, 0);

      setResourceUsageStats({
        data,
        totalUsage
      });
    };

    getResourceUsageStats()
  }, [mostUsedItems]);

  return (
    <>
      {loading ? (
        <Skeleton className="h-[180px] md:h-[220px] w-full rounded-xl" />
      ) : (
        <StatCard
          title="Resource Usage"
          value={resourceUsageStats.totalUsage || 0}
          suffix=" uses"
          icon={<BarChart4 className="h-4 w-4 text-blue-500" />}
          description={description}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={resourceUsageStats.data.slice(0, 10)}
              margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
            >
              {renderYAxis()}
              <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.1} stroke={themeColors.chartColors.resource.grid} />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: themeColors.textMuted, fontSize: 10 }}
                dy={5}
                tickFormatter={(value) => {
                  if (value?.length > 5) {
                    return value.substring(0, 3) + '...';
                  }
                  return value;
                }}
              />
              <RechartsTooltip
                content={<CustomTooltip />}
                cursor={{ fill: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' }}
              />
              <Bar
                name="Usage"
                dataKey="value"
                radius={[4, 4, 0, 0]}
                animationDuration={1500}
              >
                {resourceUsageStats.data.slice(0, 10).map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={themeColors.barColors[index % themeColors.barColors.length]} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </StatCard>
      )}
    </>)
}