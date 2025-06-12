import { useEffect, useState } from "react";
import { Battery, BatteryLow, Zap } from "lucide-react";
import BaseWidget from "./BaseWidget";

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
  }>({
    level: 0,
    charging: false,
    supported: false
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
              supported: true
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
          setBatteryInfo(prev => ({ ...prev, supported: false }));
        }
      } else {
        setBatteryInfo(prev => ({ ...prev, supported: false }));
      }
    };

    updateBatteryInfo();
  }, []);

  const getBatteryIcon = () => {
    if (batteryInfo.charging) {
      return <Zap className="h-4 w-4" />;
    }
    if (batteryInfo.level < 20) {
      return <BatteryLow className="h-4 w-4" />;
    }
    return <Battery className="h-4 w-4" />;
  };

  const getBatteryColor = () => {
    if (batteryInfo.charging) return "text-green-500";
    if (batteryInfo.level < 20) return "text-red-500";
    if (batteryInfo.level < 50) return "text-yellow-500";
    return "text-green-500";
  };

  return (
    <BaseWidget
      title="Battery"
      icon={getBatteryIcon()}
      onRemove={onRemove}
    >
      <div className="flex flex-col gap-1">
        {batteryInfo.supported ? (
          <>
            <div className="flex items-center justify-between">
              <span className={`font-medium ${getBatteryColor()}`}>
                {batteryInfo.level}%
              </span>
              <span className="text-xs text-muted-foreground">
                {batteryInfo.charging ? 'Charging' : 'Discharging'}
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5">
              <div 
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  batteryInfo.charging ? 'bg-green-500' :
                  batteryInfo.level < 20 ? 'bg-red-500' :
                  batteryInfo.level < 50 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${batteryInfo.level}%` }}
              />
            </div>
          </>
        ) : (
          <span className="text-xs text-muted-foreground">
            Battery API not supported
          </span>
        )}
      </div>
    </BaseWidget>
  );
} 