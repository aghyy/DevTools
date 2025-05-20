import ResponseTimeCard from "@/components/pages/dashboard/charts/cards/response-time";
import WeeklyActivityCard from "@/components/pages/dashboard/charts/cards/weekly-activity";
import ActiveSessionsCard from "@/components/pages/dashboard/charts/cards/active-sessions";
import RessourceUsageCard from "@/components/pages/dashboard/charts/cards/ressource-usage";

import {
  ActiveSessionsStats,
  PerformanceStats
} from "@/types/charts";

import { useChartDescriptions } from "@/hooks/charts";
import { MostUsedItem, Activity as ActivityType } from "@/services/activity";

export default function ChartSection({
  loading,
  recentItems,
  performanceStats,
  sessionsStats,
  mostUsedItems
}: {
  loading: boolean,
  recentItems: ActivityType[],
  performanceStats: PerformanceStats,
  sessionsStats: ActiveSessionsStats,
  mostUsedItems: MostUsedItem[]
}) {
  const { weeklyActivity, responseTime, activeSessions, resourceUsage } = useChartDescriptions();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
      <WeeklyActivityCard loading={loading} recentItems={recentItems} description={weeklyActivity} />
      <ResponseTimeCard loading={loading} performanceStats={performanceStats} description={responseTime} />
      <ActiveSessionsCard loading={loading} sessionsStats={sessionsStats} description={activeSessions} />
      <RessourceUsageCard loading={loading} mostUsedItems={mostUsedItems} description={resourceUsage} />
    </div>
  )
}