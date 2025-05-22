import { CardContent } from "@/components/ui/card";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserData } from "@/types/user";
import { Activity, Cpu, HardDrive } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { getSystemHealth, SystemHealth } from "@/services/healthService";

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

export default function UserWelcome({ userData, loading }: { userData: UserData | null, loading: boolean }) {
  const { theme, systemTheme } = useTheme();
  const resolvedTheme = theme === 'system' ? systemTheme : theme;
  const isDark = resolvedTheme === 'dark';
  const [healthData, setHealthData] = useState<SystemHealth | null>(null);
  const [healthLoading, setHealthLoading] = useState(true);
  const [healthError, setHealthError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHealthData = async () => {
      try {
        setHealthLoading(true);
        const data = await getSystemHealth();
        setHealthData(data);
        setHealthError(null);
      } catch (error) {
        console.error('Error fetching health data:', error);
        setHealthError('Failed to load system health');
      } finally {
        setHealthLoading(false);
      }
    };

    fetchHealthData();
    const interval = setInterval(fetchHealthData, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: 'healthy' | 'unhealthy') => {
    return status === 'healthy' ? 'text-emerald-400' : 'text-red-400';
  };

  return (
    <motion.div 
      className="mb-6 md:mb-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
    >
      <Card className={cn(
        "border shadow-lg",
        isDark ? "bg-primary/5" : "bg-primary/5"
      )}>
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div
                    key="loading-avatar"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Skeleton className="h-12 w-12 md:h-16 md:w-16 rounded-full" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="avatar"
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <Avatar className="h-12 w-12 md:h-16 md:w-16 border-4 border-primary/20 hover:border-primary/40 transition-all duration-200">
                      <AvatarImage src={userData?.avatar ? `${process.env.NEXT_PUBLIC_API_URL}/uploads/avatars/${userData.avatar}` : undefined} />
                      <AvatarFallback className="bg-primary/5 text-base md:text-lg">
                        {userData?.firstName?.charAt(0)}{userData?.lastName?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div
                    key="loading-text"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Skeleton className="h-7 w-36 md:h-8 md:w-48 mb-2" />
                    <Skeleton className="h-4 w-24 md:w-32" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="text"
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <h2 className="text-xl md:text-2xl font-bold">Welcome, {userData?.firstName}</h2>
                    <p className="text-primary/50">@{userData?.username}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <AnimatePresence mode="wait">
              {healthLoading ? (
                <motion.div
                  key="loading-health"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="bg-primary/5 rounded-lg p-2 md:p-3 backdrop-blur-sm"
                >
                  <Skeleton className="h-8 w-48" />
                </motion.div>
              ) : healthError ? (
                <motion.div
                  key="error-health"
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  className="bg-primary/5 rounded-lg p-2 md:p-3 backdrop-blur-sm"
                >
                  <div className="flex items-center gap-2 text-red-400">
                    <Activity className="h-4 w-4" />
                    <span className="text-sm font-medium">System Status Unavailable</span>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="health"
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  className="bg-primary/5 rounded-lg p-2 md:p-3 backdrop-blur-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Cpu className={cn("h-4 w-4", getStatusColor(healthData?.services.system.status || 'unhealthy'))} />
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-muted-foreground">System Uptime</span>
                        <span className="text-xs font-medium">{healthData?.services.system.uptime}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <HardDrive className="h-4 w-4 text-blue-400" />
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-muted-foreground">Memory Usage</span>
                        <span className="text-xs font-medium">{healthData?.services.system.memory.percentage}%</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-purple-400" />
                        <div className="flex flex-col">
                        <span className="text-xs font-medium text-muted-foreground">CPU Load</span>
                        <span className="text-xs font-medium">{healthData?.services.system.cpu.loadAverage[0]}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}