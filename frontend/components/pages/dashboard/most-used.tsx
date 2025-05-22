import { getIconComponent } from "@/utils/icons";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { MagicCard } from "@/components/ui/magic-card";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { MostUsedItem } from "@/services/activity";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";

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

export default function MostUsed({ loading, mostUsedItems }: { loading: boolean, mostUsedItems: MostUsedItem[] }) {
  const { theme, systemTheme } = useTheme();
  const resolvedTheme = theme === 'system' ? systemTheme : theme;
  const isDark = resolvedTheme === 'dark';

  const router = useRouter();

  const routeTo = (path: string) => {
    router.push(path);
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
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4"
        >
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-20 md:h-24 w-full rounded-lg" />
          ))}
        </motion.div>
      ) : mostUsedItems.length > 0 ? (
        <motion.div 
          key="content"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {mostUsedItems.slice(0, 6).map((item, idx) => {
            const IconComponent = getIconComponent(item.icon);
            // Ensure count is a number
            const count = typeof item.count === 'number' ? item.count : parseInt(String(item.count), 10) || 0;
            return (
              <motion.div
                key={idx}
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
                      <div className="flex flex-col flex-1 gap-1">
                        <h3 className="font-medium">{item.name}</h3>
                        <div className="flex items-center text-xs">
                          <span className={cn(
                            "px-2 py-0.5 rounded-full text-xs",
                            isDark ? "bg-primary/10 text-muted-foreground" : "bg-primary/5 text-muted-foreground"
                          )}>
                            Used {count} time{count !== 1 ? 's' : ''}
                          </span>
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
          <p className="text-slate-500">No most used items recorded yet.</p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}