// Stat Card Component with theme support and info tooltip
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

export default function StatCard({ title, value, change, suffix, icon, description, children }: {
  title: string;
  value: number | string;
  change?: number;
  suffix?: string;
  icon: React.ReactNode;
  description: string;
  children: React.ReactNode
}) {
  const { theme, systemTheme } = useTheme();
  const resolvedTheme = theme === 'system' ? systemTheme : theme;
  const isDark = resolvedTheme === 'dark';  

  const isPositive = typeof change === 'number' ? change >= 0 : undefined;
  const showPositiveAsBetter = title !== "Average Response Time"; // For response time, negative change is better

  // Format the change value
  const formatChange = (change?: number) => {
    if (change === undefined) return "";
    const sign = change >= 0 ? "+" : "";
    return `${sign}${change.toLocaleString(undefined, {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    })}%`;
  };

  const displayPositive = showPositiveAsBetter ? isPositive : !isPositive;

  return (
    <Card className={cn(
      "overflow-hidden border border-border/40",
      isDark ? "bg-card text-text" : "bg-white"
    )}>
      <CardHeader className="p-4 pb-2 space-y-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className={cn(
              "p-2 rounded-md",
              isDark ? "bg-primary/10" : "bg-primary/5"
            )}>
              {icon}
            </div>
            <CardTitle className="text-base font-medium text-muted-foreground">{title}</CardTitle>
          </div>
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={cn(
                  "p-1.5 rounded-md cursor-help opacity-70 hover:opacity-100 transition-opacity",
                  isDark ? "hover:bg-white/20" : "hover:bg-black/20"
                )}>
                  <Info className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <p>{description}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold">{value}{suffix}</span>
          {change !== undefined && (
            <div className={cn(
              "flex items-center text-sm",
              displayPositive ? "text-emerald-500" : "text-rose-500"
            )}>
              {displayPositive ? (
                <TrendingUp className="h-3 w-3 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1" />
              )}
              {formatChange(change)}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-3 py-0 mt-2 h-36 md:h-44">
        {children}
      </CardContent>
    </Card>
  );
};