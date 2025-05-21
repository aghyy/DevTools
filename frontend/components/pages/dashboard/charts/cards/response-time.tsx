import { XAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip, YAxis, LineChart as RechartsLineChart, Line } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import StatCard from "../stat-card";
import { useTheme } from "next-themes";
import CustomTooltip from "../tooltip";
import { useThemeColors } from "@/hooks/charts";
import { AlertTriangle, Hammer } from "lucide-react";
import { useEffect, useState } from "react";
import { PerformanceStats } from "@/types/charts";
import api from "@/utils/axios";

// Extended PerformanceStats type that includes tool names
interface DetailedPerformanceStats extends PerformanceStats {
  tools: string[];
  topTools: {
    name: string;
    avgResponseTime: number;
    count: number;
  }[];
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
    topTools: [] 
  });
  const [error, setError] = useState<string | null>(null);

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
    const fetchPerformanceStats = async () => {
      try {
        // Request daily averages from the API
        const response = await api.get('/api/performance/daily-averages');
        
        // Get additional data about the tools being tracked
        const toolsResponse = await api.get('/api/performance/tools-breakdown');
        
        // Combine the data
        const combinedData = {
          ...response.data,
          tools: toolsResponse.data.tools || [],
          topTools: toolsResponse.data.topTools || []
        };
        
        setPerformanceStats(combinedData);
        setError(null);
      } catch (err) {
        console.error('Error fetching performance stats:', err);
        setError('Failed to load performance data');
        
        // Fall back to mock data if we can't get real data
        generateMockData();
      }
    };

    fetchPerformanceStats();
  }, []);

  // Generate mock data for fallback
  const generateMockData = () => {
    // Simulate average response time for the last 7 days
    const days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    });

    // Simulate downward trend (improving response times)
    const baseResponseTime = 350; // ms
    const data = days.map((day, index) => ({
      name: day,
      value: parseFloat((Math.max(120, baseResponseTime - (index * 30) + (Math.random() * 40 - 20))).toFixed(2))
    }));

    // Calculate current and previous period averages
    const currentPeriod = data.slice(3).map(d => d.value);
    const previousPeriod = data.slice(0, 3).map(d => d.value);

    const currentAvg = currentPeriod.reduce((sum, val) => sum + val, 0) / currentPeriod.length;
    const previousAvg = previousPeriod.reduce((sum, val) => sum + val, 0) / previousPeriod.length;

    // Calculate percentage change (negative is good for response time)
    const change = ((currentAvg - previousAvg) / previousAvg) * 100;

    // Mock tool data
    const mockTools = ['hash', 'base64', 'proxy', 'decrypt-md5', 'decrypt-sha1'];
    const mockTopTools = [
      { name: 'hash', avgResponseTime: 142.3, count: 12 },
      { name: 'proxy', avgResponseTime: 523.7, count: 8 },
      { name: 'base64', avgResponseTime: 85.2, count: 6 }
    ];

    setPerformanceStats({
      current: parseFloat(currentAvg.toFixed(2)),
      change,
      data,
      tools: mockTools,
      topTools: mockTopTools
    });
  };

  // Format the description to include tool information
  const getEnhancedDescription = () => {
    if (error) return `${description} (Using fallback data)`;
    
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
          value={performanceStats.current}
          suffix="ms"
          change={performanceStats.change}
          icon={error ? <AlertTriangle className="h-4 w-4 text-amber-500" /> : <Hammer className="h-4 w-4 text-indigo-500" />}
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