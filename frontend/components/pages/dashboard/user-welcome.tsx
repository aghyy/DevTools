import { CardContent } from "@/components/ui/card";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserData } from "@/types/user";
import { Activity } from "lucide-react";

export default function UserWelcome({ userData, loading }: { userData: UserData | null, loading: boolean }) {

  const { theme, systemTheme } = useTheme();
  const resolvedTheme = theme === 'system' ? systemTheme : theme;
  const isDark = resolvedTheme === 'dark';

  return (
    <div className="mb-6 md:mb-8">
      <Card className={cn(
        "border shadow-lg",
        isDark ? "bg-primary/5" : "bg-primary/5"
      )}>
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              {loading ? (
                <Skeleton className="h-12 w-12 md:h-16 md:w-16 rounded-full" />
              ) : (
                <Avatar className="h-12 w-12 md:h-16 md:w-16 border-4 border-primary/20 hover:border-primary/40 transition-all duration-200">
                  <AvatarImage src={userData?.avatar ? `${process.env.NEXT_PUBLIC_API_URL}/uploads/avatars/${userData.avatar}` : undefined} />
                  <AvatarFallback className="bg-primary/5 text-base md:text-lg">
                    {userData?.firstName?.charAt(0)}{userData?.lastName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              )}
              <div>
                {loading ? (
                  <>
                    <Skeleton className="h-7 w-36 md:h-8 md:w-48 mb-2" />
                    <Skeleton className="h-4 w-24 md:w-32" />
                  </>
                ) : (
                  <>
                    <h2 className="text-xl md:text-2xl font-bold">Welcome, {userData?.firstName || 'User'}</h2>
                    <p className="text-primary/50">@{userData?.username || 'username'}</p>
                  </>
                )}
              </div>
            </div>
            <div className="bg-primary/5 rounded-lg p-3 md:p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 md:h-5 md:w-5 text-emerald-400" />
                <span className="text-xs md:text-sm text-emerald-400 font-medium">Active Session</span>
              </div>
              <p className="text-xs text-primary/50 mt-1">Last login: {new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}