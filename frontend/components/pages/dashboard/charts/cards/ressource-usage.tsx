import { ResponsiveContainer, Tooltip as RechartsTooltip, PieChart as RechartsPieChart, Pie, Cell } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import StatCard from "../stat-card";
import { useThemeColors } from "@/hooks/charts";
import { PieChart } from "lucide-react";
import PieTooltip from "../pie-tooltip";
import { MostUsedItem } from "@/services/activity";
import { useState } from "react";
import { useEffect } from "react";
import { ResourceUsageStats } from "@/types/charts";
export default function RessourceUsageCard({ loading, mostUsedItems, description }: {
  loading: boolean;
  mostUsedItems: MostUsedItem[];
  description: string;
}) {
  const themeColors = useThemeColors();
  const [resourceUsageStats, setResourceUsageStats] = useState<ResourceUsageStats>({ totalUsage: 0, data: [] });

  useEffect(() => {
    const getResourceUsageStats = () => {
      if (!mostUsedItems.length) return { totalUsage: 0, data: [] };

      const data = mostUsedItems.slice(0, 8).map(item => ({
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
          icon={<PieChart className="h-4 w-4 text-pink-500" />}
          description={description}
        >
          <ResponsiveContainer width="100%" height="100%">
            <RechartsPieChart margin={{ top: 0, right: 0, left: 0, bottom: 10 }}>
              <RechartsTooltip content={<PieTooltip />} />
              <Pie
                data={resourceUsageStats.data.slice(0, 5)}
                cx="50%"
                cy="50%"
                innerRadius={30}
                outerRadius={60}
                paddingAngle={2}
                dataKey="value"
                nameKey="name"
                label={(entry) => entry.name}
                labelLine={false}
                animationDuration={1500}
                animationBegin={300}
              >
                {resourceUsageStats.data.slice(0, 5).map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={themeColors.pieColors[index % themeColors.pieColors.length]}
                    stroke={themeColors.pieColors[index % themeColors.pieColors.length]}
                    strokeWidth={2}
                  />
                ))}
              </Pie>
            </RechartsPieChart>
          </ResponsiveContainer>
        </StatCard>
      )}
    </>)
}