import { XAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip, YAxis, LineChart as RechartsLineChart, Line } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import StatCard from "../stat-card";
import { useTheme } from "next-themes";
import CustomTooltip from "../tooltip";
import { useThemeColors } from "@/hooks/charts";
import { Hammer } from "lucide-react";
import { useEffect, useState } from "react";
import { PerformanceStats } from "@/types/charts";
import api from "@/utils/axios";
import { toast } from "sonner";

// Extended PerformanceStats type that includes tool names
interface DetailedPerformanceStats extends PerformanceStats {
  tools: string[];
  topTools: {
    name: string;
    avgResponseTime: number;
    count: number;
  }[];
  weeklyAvg?: number; // New field for weekly average
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

  const renderYAxis = (chart: string) => (
    <YAxis
      axisLine={false}
      tickLine={false}
      tick={{ fill: themeColors.textMuted, fontSize: 10 }}
      width={35} // Ensure there's enough space for the axis
      tickFormatter={(value) => chart === 'response' ? `${value.toFixed(0)}` : `${value}`}
      style={{ fontSize: '10px' }}
      domain={chart === 'activity' ? [0, 'dataMax + 2'] : ['dataMin - 5', 'dataMax + 5']}
    />
  );

  useEffect(() => {
    const fetchPerformanceStats = async () => {
      try {
        // Request daily averages from the API
        const response = await api.get('/api/performance/daily-averages');
        
        // Get additional data about the tools being tracked
        const toolsResponse = await api.get('/api/performance/tools-breakdown');
        
        // Calculate weekly average from all data points
        const weeklyAvg = response.data.data.reduce((sum: number, item: { value: number }) => 
          sum + item.value, 0) / response.data.data.length;
        
        // Combine the data
        const combinedData = {
          ...response.data,
          tools: toolsResponse.data.tools || [],
          topTools: toolsResponse.data.topTools || [],
          weeklyAvg: parseFloat(weeklyAvg.toFixed(2))
        };
        
        setPerformanceStats(combinedData);
      } catch {
        toast.error("Failed to load performance data");
      }
    };

    fetchPerformanceStats();
  }, []);

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