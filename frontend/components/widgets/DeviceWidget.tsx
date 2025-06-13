import { useEffect, useState } from "react";
import { Smartphone, Monitor, Tablet, Laptop, HardDrive } from "lucide-react";
import BaseWidget from "./BaseWidget";
import { cn } from "@/lib/utils";

interface DeviceWidgetProps {
  onRemove?: () => void;
}

export default function DeviceWidget({ onRemove }: DeviceWidgetProps) {
  const [deviceInfo, setDeviceInfo] = useState<{
    deviceType: string;
    platform: string;
    browser: string;
    architecture: string;
    cores: number;
    supported: boolean;
    loading: boolean;
  }>({
    deviceType: 'Unknown',
    platform: 'Unknown',
    browser: 'Unknown',
    architecture: 'Unknown',
    cores: 0,
    supported: false,
    loading: true
  });

  useEffect(() => {
    const updateDeviceInfo = () => {
      if (typeof window !== 'undefined' && navigator) {
        const userAgent = navigator.userAgent;
        
        // Detect device type
        let deviceType = 'Desktop';
        if (/iPhone|iPod/i.test(userAgent)) {
          deviceType = 'iPhone';
        } else if (/iPad/i.test(userAgent)) {
          deviceType = 'iPad';
        } else if (/Android/i.test(userAgent)) {
          deviceType = 'Android';
        } else if (/Mobile/i.test(userAgent)) {
          deviceType = 'Mobile';
        }

        // Detect browser
        let browser = 'Unknown';
        if (userAgent.includes('Chrome')) {
          browser = 'Chrome';
        } else if (userAgent.includes('Firefox')) {
          browser = 'Firefox';
        } else if (userAgent.includes('Safari')) {
          browser = 'Safari';
        } else if (userAgent.includes('Edge')) {
          browser = 'Edge';
        }

        // Get hardware info if available
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const cores = (navigator as any).hardwareConcurrency || 0;

        setDeviceInfo({
          deviceType,
          platform: navigator.platform || 'Unknown',
          browser,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          architecture: (navigator as any).userAgentData?.platform || 'Unknown',
          cores,
          supported: true,
          loading: false
        });
      } else {
        setDeviceInfo(prev => ({ ...prev, supported: false, loading: false }));
      }
    };

    updateDeviceInfo();
  }, []);

  const getDeviceIcon = () => {
    if (deviceInfo.loading) {
      return <Smartphone className="h-4 w-4 animate-pulse" />;
    }
    
    const { deviceType } = deviceInfo;
    if (deviceType.includes('iPhone') || deviceType.includes('Android') || deviceType === 'Mobile') {
      return <Smartphone className="h-4 w-4" />;
    } else if (deviceType.includes('iPad')) {
      return <Tablet className="h-4 w-4" />;
    } else if (deviceType === 'Desktop') {
      return <Monitor className="h-4 w-4" />;
    }
    return <Laptop className="h-4 w-4" />;
  };

  const getDeviceCategory = () => {
    if (deviceInfo.loading) return { color: "text-muted-foreground", text: "Loading..." };
    if (!deviceInfo.supported) return { color: "text-muted-foreground", text: "Not supported" };
    
    const { deviceType, cores } = deviceInfo;
    
    // Categorize by device capabilities
    if (deviceType.includes('iPhone') || deviceType.includes('iPad')) {
      return { color: "text-blue-500", text: "iOS Device" };
    } else if (deviceType.includes('Android')) {
      return { color: "text-green-500", text: "Android" };
    } else if (deviceType === 'Desktop') {
      if (cores >= 8) {
        return { color: "text-emerald-500", text: "High-End PC" };
      } else if (cores >= 4) {
        return { color: "text-blue-500", text: "Standard PC" };
      }
      return { color: "text-yellow-500", text: "Basic PC" };
    }
    return { color: "text-muted-foreground", text: "Unknown" };
  };

  const getPerformanceLevel = () => {
    const { cores } = deviceInfo;
    if (!cores) return { color: "text-muted-foreground", text: "Unknown" };
    
    if (cores >= 12) return { color: "text-emerald-500", text: "High Performance" };
    if (cores >= 8) return { color: "text-blue-500", text: "Good Performance" };
    if (cores >= 4) return { color: "text-yellow-500", text: "Basic Performance" };
    return { color: "text-orange-500", text: "Limited Performance" };
  };

  const formatCores = () => {
    if (!deviceInfo.cores) return 'N/A';
    return `${deviceInfo.cores} cores`;
  };

  const status = getDeviceCategory();
  const performance = getPerformanceLevel();

  return (
    <BaseWidget
      title="Device"
      icon={getDeviceIcon()}
      onRemove={onRemove}
    >
      <div className="w-full space-y-2">
        {deviceInfo.supported && !deviceInfo.loading ? (
          <>
            {/* Device Type and Category */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={cn("text-lg font-semibold", status.color)}>
                  {deviceInfo.deviceType}
                </span>
              </div>
              <span className={cn("text-xs font-medium", status.color)}>
                {status.text}
              </span>
            </div>

            {/* Platform and Browser */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {deviceInfo.platform}
              </span>
              <span>
                {deviceInfo.browser}
              </span>
            </div>

            {/* Hardware Info */}
            {deviceInfo.cores > 0 && (
              <div className="text-center text-xs text-muted-foreground">
                {formatCores()}
              </div>
            )}

            {/* Performance Level */}
            {deviceInfo.cores > 0 && (
              <div className="text-center">
                <span className={cn("text-xs font-medium", performance.color)}>
                  {performance.text}
                </span>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-1">
            {deviceInfo.loading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <HardDrive className="h-4 w-4 animate-pulse" />
                <span className="text-xs">Loading...</span>
              </div>
            ) : (
              <div className="text-center">
                <HardDrive className="h-5 w-5 text-muted-foreground/50 mx-auto mb-1" />
                <span className="text-xs text-muted-foreground">
                  Device API not available
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </BaseWidget>
  );
} 