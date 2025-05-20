import { ResponsiveContainer, Tooltip as RechartsTooltip, PieChart as RechartsPieChart, Pie, Cell } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import StatCard from "../stat-card";
import { ResourceUsageStats } from "@/types/charts";
import { useThemeColors } from "@/hooks/charts";
import { PieChart } from "lucide-react";
import PieTooltip from "../pie-tooltip";

export default function RessourceUsageCard({ loading, resourceUsageStats, description }: {
  loading: boolean;
  resourceUsageStats: ResourceUsageStats;
  description: string;
}) {
  const themeColors = useThemeColors();

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
            <RechartsPieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <RechartsTooltip content={<PieTooltip />} />
              <Pie
                data={resourceUsageStats.data.slice(0, 5)} // Show top 5 for better visualization
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
                  />
                ))}
              </Pie>
            </RechartsPieChart>
          </ResponsiveContainer>
        </StatCard>
      )}
    </>)
}