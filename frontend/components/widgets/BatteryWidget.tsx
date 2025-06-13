import { useEffect, useState } from "react";
import { Battery, BatteryLow, Zap, Plug } from "lucide-react";
import BaseWidget from "./BaseWidget";
import { cn } from "@/lib/utils";

interface BatteryManager {
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
  level: number;
  addEventListener: (type: string, listener: () => void) => void;
  removeEventListener: (type: string, listener: () => void) => void;
}

interface NavigatorWithBattery extends Navigator {
  getBattery?: () => Promise<BatteryManager>;
}

interface BatteryWidgetProps {
  onRemove?: () => void;
}

export default function BatteryWidget({ onRemove }: BatteryWidgetProps) {
  const [batteryInfo, setBatteryInfo] = useState<{
    level: number;
    charging: boolean;
    supported: boolean;
    loading: boolean;
  }>({
    level: 0,
    charging: false,
    supported: false,
    loading: true
  });

  useEffect(() => {
    const updateBatteryInfo = async () => {
      const nav = navigator as NavigatorWithBattery;
      
      if ('getBattery' in nav && nav.getBattery) {
        try {
          const battery = await nav.getBattery();
          
          const updateInfo = () => {
            setBatteryInfo({
              level: Math.round(battery.level * 100),
              charging: battery.charging,
              supported: true,
              loading: false
            });
          };

          updateInfo();

          // Listen for battery events
          battery.addEventListener('chargingchange', updateInfo);
          battery.addEventListener('levelchange', updateInfo);

          return () => {
            battery.removeEventListener('chargingchange', updateInfo);
            battery.removeEventListener('levelchange', updateInfo);
          };
        } catch {
          setBatteryInfo({
            level: 0,
            charging: false,
            supported: false,
            loading: false
          });
        }
      } else {
        setBatteryInfo({
          level: 0,
          charging: false,
          supported: false,
          loading: false
        });
      }
    };

    updateBatteryInfo();
  }, []);

  const getBatteryIcon = () => {
    if (batteryInfo.loading) {
      return <Battery className="h-4 w-4 animate-pulse" />;
    }
    if (batteryInfo.charging) {
      return <Zap className="h-4 w-4" />;
    }
    if (batteryInfo.level < 20) {
      return <BatteryLow className="h-4 w-4" />;
    }
    return <Battery className="h-4 w-4" />;
  };

  const getBatteryStatus = () => {
    if (batteryInfo.loading) return { color: "text-muted-foreground", text: "Loading..." };
    if (!batteryInfo.supported) return { color: "text-muted-foreground", text: "Not supported" };
    
    if (batteryInfo.charging) {
      return { color: "text-emerald-500", text: "Charging" };
    }
    
    if (batteryInfo.level < 10) return { color: "text-red-500", text: "Critical" };
    if (batteryInfo.level < 20) return { color: "text-orange-500", text: "Low" };
    if (batteryInfo.level < 50) return { color: "text-yellow-500", text: "Medium" };
    return { color: "text-emerald-500", text: "Good" };
  };

  const getBatteryBarColor = () => {
    if (batteryInfo.charging) return "bg-emerald-500";
    if (batteryInfo.level < 10) return "bg-red-500";
    if (batteryInfo.level < 20) return "bg-orange-500";
    if (batteryInfo.level < 50) return "bg-yellow-500";
    return "bg-emerald-500";
  };

  const status = getBatteryStatus();

  return (
    <BaseWidget
      title="Battery"
      icon={getBatteryIcon()}
      onRemove={onRemove}
    >
      <div className="w-full space-y-2">
        {batteryInfo.supported && !batteryInfo.loading ? (
          <>
            {/* Battery Level and Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={cn("text-lg font-semibold tabular-nums", status.color)}>
                  {batteryInfo.level}%
                </span>
                {batteryInfo.charging && (
                  <Plug className="h-3 w-3 text-emerald-500" />
                )}
              </div>
              <span className={cn("text-xs font-medium", status.color)}>
                {status.text}
              </span>
            </div>

            {/* Battery Progress Bar */}
            <div className="relative">
              <div className="w-full bg-muted/60 rounded-full h-2 overflow-hidden">
                <div 
                  className={cn(
                    "h-full rounded-full transition-all duration-500 ease-out relative",
                    getBatteryBarColor()
                  )}
                  style={{ width: `${Math.max(batteryInfo.level, 2)}%` }}
                >
                  {batteryInfo.charging && (
                    <div className="absolute inset-0 bg-white/30 animate-pulse rounded-full" />
                  )}
                </div>
              </div>
              
              {/* Battery level markers */}
              <div className="absolute top-0 w-full h-2 flex justify-between items-center px-0.5">
                {[25, 50, 75].map((marker) => (
                  <div 
                    key={marker}
                    className="w-px h-1 bg-background/80 rounded-full"
                  />
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-1">
            {batteryInfo.loading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Battery className="h-4 w-4 animate-pulse" />
                <span className="text-xs">Loading...</span>
              </div>
            ) : (
              <div className="text-center">
                <Battery className="h-5 w-5 text-muted-foreground/50 mx-auto mb-1" />
                <span className="text-xs text-muted-foreground">
                  Battery API not available
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </BaseWidget>
  );
} 