import { Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { MagicCard } from "@/components/ui/magic-card";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { getIconComponent } from "@/utils/icons";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity as ActivityType,
} from "@/services/activity";

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

const itemVariants = {
  hidden: { 
    opacity: 0, 
    y: 10,
    scale: 0.98
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

export default function RecentActivities({ loading, recentItems }: { loading: boolean, recentItems: ActivityType[] }) {
  const { theme, systemTheme } = useTheme();
  const resolvedTheme = theme === 'system' ? systemTheme : theme;
  const isDark = resolvedTheme === 'dark';
  const router = useRouter();

  const routeTo = (path: string) => {
    router.push(path);
  };

  // Format relative time
  const formatRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffDay > 0) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
    if (diffHour > 0) return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
    if (diffMin > 0) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
    return 'just now';
  };

  return (
    <AnimatePresence mode="wait">
      {loading ? (
        <motion.div
          key="loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4"
        >
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <Skeleton key={i} className="h-20 md:h-24 w-full rounded-lg" />
          ))}
        </motion.div>
      ) : recentItems.length > 0 ? (
        <motion.div 
          key="content"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {recentItems.slice(0, 8).map((item) => {
            const IconComponent = getIconComponent(item.icon);
            return (
              <motion.div
                key={item.id}
                variants={itemVariants}
              >
                <MagicCard
                  className="overflow-hidden cursor-pointer"
                  onClick={() => routeTo(item.path)}
                >
                  <Card className="h-full border-0 bg-transparent">
                    <CardContent className="p-3 md:p-4 flex items-center gap-3 md:gap-4">
                      <div className={cn(
                        "p-2 md:p-3 rounded-full",
                        isDark ? "bg-primary/10" : "bg-primary/5"
                      )}>
                        <IconComponent className="h-4 w-4 md:h-5 md:w-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-ellipsis overflow-hidden whitespace-nowrap">{item.name}</h3>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          {item.createdAt ? formatRelativeTime(item.createdAt) : 'Recently'}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </MagicCard>
              </motion.div>
            );
          })}
        </motion.div>
      ) : (
        <motion.div
          key="empty"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="p-6 md:p-8 text-center border rounded-lg bg-slate-50 dark:bg-slate-900/20"
        >
          <p className="text-slate-500">No activity recorded yet. Start using tools and resources!</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
