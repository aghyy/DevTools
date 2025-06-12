import { XAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip, YAxis, LineChart as RechartsLineChart, Line } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import StatCard from "../stat-card";
import { useTheme } from "next-themes";
import CustomTooltip from "../tooltip";
import { useThemeColors } from "@/hooks/charts";
import { Hammer } from "lucide-react";
import { useEffect, useState } from "react";
import { PerformanceStats } from "@/types/charts";
import { getResponseTimeChartData } from "@/services/performanceService";

// Extended PerformanceStats type that includes tool names
interface DetailedPerformanceStats extends PerformanceStats {
  tools: string[];
  topTools: {
    name: string;
    avgResponseTime: number;
    count: number;
  }[];
  weeklyAvg?: number;
}

export default function ResponseTimeCard({ loading, description }: {
  loading: boolean;
  description: string;
}) {
  const { theme, systemTheme } = useTheme();
  const resolvedTheme = theme === 'system' ? systemTheme : theme;
  const isDark = resolvedTheme === 'dark';
  const themeColors = useThemeColors();

  const [performanceStats, setPerformanceStats] = useState<DetailedPerformanceStats>({ 
    current: 0, 
    change: 0, 
    data: [],
    tools: [],
    topTools: [],
    weeklyAvg: 0 
  });

  const renderYAxis = () => (
    <YAxis
      axisLine={false}
      tickLine={false}
      tick={{ fill: themeColors.textMuted, fontSize: 10 }}
      width={35}
      tickFormatter={(value) => Math.round(value).toString()}
      style={{ fontSize: '10px' }}
      domain={[0, 'dataMax + 5']}
    />
  );

  useEffect(() => {
    const fetchPerformanceData = async () => {
      if (!loading) {
        try {
          const data = await getResponseTimeChartData();
          setPerformanceStats(data);
        } catch (error) {
          console.error('Error fetching response time data:', error);
          // Set default empty data
          setPerformanceStats({ 
            current: 0, 
            change: 0, 
            data: [], 
            tools: [], 
            topTools: [], 
            weeklyAvg: 0 
          });
        }
      }
    };

    fetchPerformanceData();
  }, [loading]);

  // Format the description to include tool information
  const getEnhancedDescription = () => {
    if (performanceStats.tools.length > 0) {
      const toolCount = performanceStats.tools.length;
      const toolsText = toolCount === 1 
        ? '1 tool endpoint' 
        : `${toolCount} tool endpoints`;
      
      return `${description} Tracking ${toolsText}.`;
    }
    
    return description;
  };

  return (
    <>
      {loading ? (
        <Skeleton className="h-[180px] md:h-[220px] w-full rounded-xl" />
      ) : (
        <StatCard
          title="Average Response Time"
          value={performanceStats.weeklyAvg || 0}
          suffix="ms"
          change={performanceStats.change}
          icon={<Hammer className="h-4 w-4 text-indigo-500" />}
          description={getEnhancedDescription()}
        >
          <ResponsiveContainer width="100%" height="100%">
            <RechartsLineChart
              data={performanceStats.data}
              margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
            >
              {renderYAxis()}
              <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.1} stroke={themeColors.chartColors.response.grid} />
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