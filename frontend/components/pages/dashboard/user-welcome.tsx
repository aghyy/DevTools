import { CardContent } from "@/components/ui/card";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserData } from "@/types/user";
import { Activity } from "lucide-react";
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

export default function UserWelcome({ userData, loading }: { userData: UserData | null, loading: boolean }) {
  const { theme, systemTheme } = useTheme();
  const resolvedTheme = theme === 'system' ? systemTheme : theme;
  const isDark = resolvedTheme === 'dark';

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
              {!loading && (
                <motion.div 
                  key="status"
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  className="bg-primary/5 rounded-lg p-3 md:p-4 backdrop-blur-sm"
                >
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 md:h-5 md:w-5 text-emerald-400" />
                    <span className="text-xs md:text-sm text-emerald-400 font-medium">Active Session</span>
                  </div>
                  <p className="text-xs text-primary/50 mt-1">Last login: {new Date().toLocaleDateString()}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}