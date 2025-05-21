import ResponseTimeCard from "@/components/pages/dashboard/charts/cards/response-time";
import WeeklyActivityCard from "@/components/pages/dashboard/charts/cards/weekly-activity";
import RessourceUsageCard from "@/components/pages/dashboard/charts/cards/ressource-usage";
import { useChartDescriptions } from "@/hooks/charts";
import { MostUsedItem, Activity as ActivityType } from "@/services/activity";

export default function ChartSection({
  loading,
  recentItems,
  mostUsedItems
}: {
  loading: boolean,
  recentItems: ActivityType[],
  mostUsedItems: MostUsedItem[]
}) {
  const { weeklyActivity, responseTime, resourceUsage } = useChartDescriptions();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      <WeeklyActivityCard loading={loading} recentItems={recentItems} description={weeklyActivity} />
      <ResponseTimeCard loading={loading} description={responseTime} />
      <RessourceUsageCard loading={loading} mostUsedItems={mostUsedItems} description={resourceUsage} />
    </div>
  )
}