import { useEffect, useState } from "react";
import { HardDrive } from "lucide-react";
import BaseWidget from "./BaseWidget";

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
  const [memoryInfo, setMemoryInfo] = useState<{ percentage: number; used: number; total: number }>({
    percentage: 0,
    used: 0,
    total: 0
  });

  useEffect(() => {
    const updateMemory = () => {
      const memory = (performance as ExtendedPerformance).memory;
      if (memory) {
        const percentage = Math.round((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100);
        const used = Math.round(memory.usedJSHeapSize / (1024 * 1024));
        const total = Math.round(memory.jsHeapSizeLimit / (1024 * 1024));
        
        setMemoryInfo({ percentage, used, total });
      }
    };

    updateMemory();
    const interval = setInterval(updateMemory, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <BaseWidget
      title="Memory"
      icon={<HardDrive className="h-4 w-4" />}
      onRemove={onRemove}
    >
      <div className="flex items-end justify-between w-full h-full">
        <div className="flex flex-col">
          <span className="font-medium text-foreground leading-tight">{memoryInfo.percentage}%</span>
          <div className="w-16 bg-muted rounded-full h-1.5 mt-1 overflow-hidden">
            <div 
              className="bg-primary h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(memoryInfo.percentage, 100)}%` }}
            />
          </div>
        </div>
        <span className="text-xs text-muted-foreground">
          {memoryInfo.used}MB
        </span>
      </div>
    </BaseWidget>
  );
} 