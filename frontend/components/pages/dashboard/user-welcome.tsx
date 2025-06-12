import { CardContent } from "@/components/ui/card";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserData } from "@/types/user";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Sparkles, TrendingUp } from "lucide-react";
import { useState, useEffect, useMemo } from "react";

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
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour >= 0 && hour < 5) return "Good night";      // 12:00 AM - 4:59 AM
    if (hour >= 5 && hour < 12) return "Good morning";   // 5:00 AM - 11:59 AM
    if (hour >= 12 && hour < 17) return "Good afternoon"; // 12:00 PM - 4:59 PM
    if (hour >= 17 && hour < 22) return "Good evening";   // 5:00 PM - 9:59 PM
    return "Good night";                                   // 10:00 PM - 11:59 PM
  };

  // Use useMemo to ensure the message only changes on component mount/refresh
  const motivationalMessage = useMemo(() => {
    const messages = [
      "Ready to boost your productivity?",
      "Let's make today amazing!",
      "Time to tackle your goals!",
      "Your tools are ready when you are!",
      "Let's build something great today!"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }, []); // Empty dependency array means this only runs once on mount

  return (
    <motion.div 
      className="mb-6 md:mb-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
    >
      {/* Main Welcome Card */}
      <Card className="bg-primary/5 border shadow-sm">
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            {/* User Info Section */}
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
                    <Skeleton className="h-16 w-16 md:h-20 md:w-20 rounded-full" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="avatar"
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <Avatar className="h-16 w-16 md:h-20 md:w-20 border-4 border-primary/20 hover:border-primary/40 transition-all duration-200 shadow-lg">
                      <AvatarImage src={userData?.avatar ? `${process.env.NEXT_PUBLIC_API_URL}/uploads/avatars/${userData.avatar}` : undefined} />
                      <AvatarFallback className="bg-primary/10 text-lg md:text-xl font-semibold">
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
                    className="space-y-2"
                  >
                    <Skeleton className="h-8 w-48 md:h-9 md:w-64" />
                    <Skeleton className="h-5 w-32 md:w-40" />
                    <Skeleton className="h-4 w-40 md:w-56" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="text"
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-1"
                  >
                    <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                      {getGreeting()}, {userData?.firstName}!
                      <Sparkles className="h-6 w-6 text-yellow-500" />
                    </h1>
                    <p className="text-muted-foreground font-medium">@{userData?.username}</p>
                    <p className="text-sm text-muted-foreground/80 flex items-center gap-1">
                      <TrendingUp className="h-4 w-4" />
                      {motivationalMessage}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Time & Quick Stats */}
            {!loading && (
              <motion.div
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                className="flex flex-col items-start md:items-end gap-2"
              >
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span className="font-mono">
                    {currentTime.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground/70">
                  {currentTime.toLocaleDateString([], { 
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}