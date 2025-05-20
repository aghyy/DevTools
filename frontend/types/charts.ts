export type TooltipProps = {
  active?: boolean;
  payload?: Array<{
    name?: string;
    value: number | string;
    unit?: string;
    color?: string;
    payload?: {
      fill?: string;
    };
  }>;
  label?: string;
  style?: React.CSSProperties;
};

export type DefaultChartData = {
  current: number;
  change: number;
  data: { name: string; value: number }[];
};

export type ComparisonChartData = {
  current: number;
  change: number;
  data: { name: string; current: number; previous: number; }[];
};

export type PieChartData = {
  data: { name: string; value: number }[];
  totalUsage: number;
};

export type ActivityTrend = DefaultChartData;
export type PerformanceStats = DefaultChartData;
export type ResourceUsageStats = PieChartData;
export type ActiveSessionsStats = ComparisonChartData;

export type ChartDescriptions = {
  weeklyActivity: string;
  responseTime: string;
  activeSessions: string;
  resourceUsage: string;
};
