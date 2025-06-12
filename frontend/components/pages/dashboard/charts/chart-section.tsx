import ResponseTimeCard from "@/components/pages/dashboard/charts/cards/response-time";
import WeeklyActivityCard from "@/components/pages/dashboard/charts/cards/weekly-activity";
import RessourceUsageCard from "@/components/pages/dashboard/charts/cards/ressource-usage";
import { useChartDescriptions } from "@/hooks/charts";
import { MostUsedItem } from "@/services/activity";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
      when: "beforeChildren",
      staggerChildren: 0.1
    }
  }
};

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

export default function ChartSection({
  loading,
  mostUsedItems
}: {
  loading: boolean,
  mostUsedItems: MostUsedItem[]
}) {
  const { weeklyActivity, responseTime, resourceUsage } = useChartDescriptions();

  return (
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
    >
      <motion.div variants={cardVariants} className="col-span-1">
        <WeeklyActivityCard loading={loading} description={weeklyActivity} />
      </motion.div>

      <motion.div variants={cardVariants} className="col-span-1">
        <ResponseTimeCard loading={loading} description={responseTime} />
      </motion.div>

      <motion.div variants={cardVariants} className="col-span-1">
        <RessourceUsageCard loading={loading} mostUsedItems={mostUsedItems} description={resourceUsage} />
      </motion.div>
    </motion.div>
  )
}