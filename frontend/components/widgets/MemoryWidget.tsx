import { useEffect, useState } from "react";
import { HardDrive, TrendingUp, AlertTriangle } from "lucide-react";
import BaseWidget from "./BaseWidget";
import { cn } from "@/lib/utils";

interface PerformanceMemory {
  jsHeapSizeLimit: number;
  totalJSHeapSize: number;
  usedJSHeapSize: number;
}

interface ExtendedPerformance extends Performance {
  memory?: PerformanceMemory;
}

interface MemoryWidgetProps {
  onRemove?: () => void;
}

export default function MemoryWidget({ onRemove }: MemoryWidgetProps) {
  const [memoryInfo, setMemoryInfo] = useState<{
    percentage: number;
    used: number;
    total: number;
    supported: boolean;
    loading: boolean;
  }>({
    percentage: 0,
    used: 0,
    total: 0,
    supported: false,
    loading: true
  });

  useEffect(() => {
    const updateMemory = () => {
      const memory = (performance as ExtendedPerformance).memory;
      if (memory) {
        const percentage = Math.round((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100);
        const used = Math.round(memory.usedJSHeapSize / (1024 * 1024));
        const total = Math.round(memory.jsHeapSizeLimit / (1024 * 1024));
        
        setMemoryInfo({ percentage, used, total, supported: true, loading: false });
      } else {
        setMemoryInfo(prev => ({ ...prev, supported: false, loading: false }));
      }
    };

    updateMemory();
    const interval = setInterval(updateMemory, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, []);

  const getMemoryIcon = () => {
    if (memoryInfo.loading) {
      return <HardDrive className="h-4 w-4 animate-pulse" />;
    }
    if (memoryInfo.percentage > 85) {
      return <AlertTriangle className="h-4 w-4" />;
    }
    if (memoryInfo.percentage > 70) {
      return <TrendingUp className="h-4 w-4" />;
    }
    return <HardDrive className="h-4 w-4" />;
  };

  const getMemoryStatus = () => {
    if (memoryInfo.loading) return { color: "text-muted-foreground", text: "Loading..." };
    if (!memoryInfo.supported) return { color: "text-muted-foreground", text: "Not supported" };
    
    if (memoryInfo.percentage > 90) return { color: "text-red-500", text: "Critical" };
    if (memoryInfo.percentage > 80) return { color: "text-orange-500", text: "High" };
    if (memoryInfo.percentage > 60) return { color: "text-yellow-500", text: "Medium" };
    if (memoryInfo.percentage > 40) return { color: "text-blue-500", text: "Normal" };
    return { color: "text-emerald-500", text: "Low" };
  };

  const getMemoryBarColor = () => {
    if (memoryInfo.percentage > 90) return "bg-red-500";
    if (memoryInfo.percentage > 80) return "bg-orange-500";
    if (memoryInfo.percentage > 60) return "bg-yellow-500";
    if (memoryInfo.percentage > 40) return "bg-blue-500";
    return "bg-emerald-500";
  };

  const formatBytes = (bytes: number) => {
    if (bytes >= 1024) {
      return `${(bytes / 1024).toFixed(1)}GB`;
    }
    return `${bytes}MB`;
  };

  const status = getMemoryStatus();

  return (
    <BaseWidget
      title="Memory"
      icon={getMemoryIcon()}
      onRemove={onRemove}
    >
      <div className="w-full space-y-2">
        {memoryInfo.supported && !memoryInfo.loading ? (
          <>
            {/* Memory Usage and Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={cn("text-lg font-semibold tabular-nums", status.color)}>
                  {memoryInfo.percentage}%
                </span>
                {memoryInfo.percentage > 85 && (
                  <AlertTriangle className="h-3 w-3 text-orange-500" />
                )}
              </div>
              <span className={cn("text-xs font-medium", status.color)}>
                {status.text}
              </span>
            </div>

            {/* Memory Progress Bar */}
            <div className="relative">
              <div className="w-full bg-muted/60 rounded-full h-2 overflow-hidden">
                <div 
                  className={cn(
                    "h-full rounded-full transition-all duration-500 ease-out relative",
                    getMemoryBarColor()
                  )}
                  style={{ width: `${Math.max(memoryInfo.percentage, 2)}%` }}
                >
                  {memoryInfo.percentage > 85 && (
                    <div className="absolute inset-0 bg-white/30 animate-pulse rounded-full" />
                  )}
                </div>
              </div>
              
              {/* Memory level markers */}
              <div className="absolute top-0 w-full h-2 flex justify-between items-center px-0.5">
                {[25, 50, 75].map((marker) => (
                  <div 
                    key={marker}
                    className="w-px h-1 bg-background/80 rounded-full"
                  />
                ))}
              </div>
            </div>

            {/* Memory Details */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {formatBytes(memoryInfo.used)} used
              </span>
              <span>
                {formatBytes(memoryInfo.total)} limit
              </span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-1">
            {memoryInfo.loading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <HardDrive className="h-4 w-4 animate-pulse" />
                <span className="text-xs">Loading...</span>
              </div>
            ) : (
              <div className="text-center">
                <HardDrive className="h-5 w-5 text-muted-foreground/50 mx-auto mb-1" />
                <span className="text-xs text-muted-foreground">
                  Memory API not available
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </BaseWidget>
  );
} 