import { useEffect, useState } from "react";
import { Wifi, WifiOff, Signal, Smartphone, Router, Globe } from "lucide-react";
import BaseWidget from "./BaseWidget";
import { cn } from "@/lib/utils";

interface NetworkInformation extends EventTarget {
  effectiveType?: '2g' | '3g' | '4g' | 'slow-2g';
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
  type?: string;
}

interface NavigatorWithConnection extends Navigator {
  connection?: NetworkInformation;
  mozConnection?: NetworkInformation;
  webkitConnection?: NetworkInformation;
}

interface NetworkWidgetProps {
  onRemove?: () => void;
}

export default function NetworkWidget({ onRemove }: NetworkWidgetProps) {
  const [networkInfo, setNetworkInfo] = useState<{
    online: boolean;
    effectiveType: string;
    downlink: number | null;
    rtt: number | null;
    saveData: boolean;
    supported: boolean;
    loading: boolean;
  }>({
    online: navigator.onLine,
    effectiveType: 'unknown',
    downlink: null,
    rtt: null,
    saveData: false,
    supported: false,
    loading: true
  });

  useEffect(() => {
    const nav = navigator as NavigatorWithConnection;
    const connection = nav.connection || nav.mozConnection || nav.webkitConnection;

    const updateNetworkInfo = () => {
      setNetworkInfo({
        online: navigator.onLine,
        effectiveType: connection?.effectiveType || 'unknown',
        downlink: connection?.downlink || null,
        rtt: connection?.rtt || null,
        saveData: connection?.saveData || false,
        supported: !!connection,
        loading: false
      });
    };

    updateNetworkInfo();

    // Listen for online/offline events
    const handleOnline = () => updateNetworkInfo();
    const handleOffline = () => updateNetworkInfo();

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Listen for connection changes if supported
    if (connection) {
      try {
        connection.addEventListener('change', updateNetworkInfo);
      } catch {
        // Ignore if addEventListener is not supported
      }
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (connection) {
        try {
          connection.removeEventListener('change', updateNetworkInfo);
        } catch {
          // Ignore if removeEventListener is not supported
        }
      }
    };
  }, []);

  const getNetworkIcon = () => {
    if (networkInfo.loading) {
      return <Wifi className="h-4 w-4 animate-pulse" />;
    }
    if (!networkInfo.online) {
      return <WifiOff className="h-4 w-4" />;
    }
    
    // Choose icon based on connection type
    if (networkInfo.effectiveType === '4g') {
      return <Signal className="h-4 w-4" />;
    } else if (['2g', '3g', 'slow-2g'].includes(networkInfo.effectiveType)) {
      return <Smartphone className="h-4 w-4" />;
    } else if (networkInfo.supported) {
      return <Router className="h-4 w-4" />;
    }
    return <Globe className="h-4 w-4" />;
  };

  const getConnectionStatus = () => {
    if (networkInfo.loading) return { color: "text-muted-foreground", text: "Loading..." };
    if (!networkInfo.online) return { color: "text-red-500", text: "Offline" };
    
    switch (networkInfo.effectiveType) {
      case 'slow-2g':
        return { color: "text-red-500", text: "Slow 2G" };
      case '2g':
        return { color: "text-orange-500", text: "2G" };
      case '3g':
        return { color: "text-yellow-500", text: "3G" };
      case '4g':
        return { color: "text-emerald-500", text: "4G" };
      default:
        return { color: "text-blue-500", text: "Online" };
    }
  };

  const getSpeedCategory = () => {
    if (!networkInfo.downlink) return { color: "text-muted-foreground", text: "Unknown" };
    
    const speed = networkInfo.downlink;
    if (speed >= 10) return { color: "text-emerald-500", text: "Fast" };
    if (speed >= 1.5) return { color: "text-blue-500", text: "Good" };
    if (speed >= 0.5) return { color: "text-yellow-500", text: "Slow" };
    return { color: "text-red-500", text: "Very Slow" };
  };

  const formatSpeed = () => {
    if (!networkInfo.downlink) return 'N/A';
    if (networkInfo.downlink >= 1) {
      return `${networkInfo.downlink.toFixed(1)} Mbps`;
    }
    return `${(networkInfo.downlink * 1000).toFixed(0)} Kbps`;
  };

  const formatLatency = () => {
    if (!networkInfo.rtt) return 'N/A';
    return `${networkInfo.rtt}ms`;
  };

  const status = getConnectionStatus();
  const speedCategory = getSpeedCategory();

  return (
    <BaseWidget
      title="Network"
      icon={getNetworkIcon()}
      onRemove={onRemove}
    >
      <div className="w-full space-y-2">
        {!networkInfo.loading ? (
          <>
            {/* Connection Status and Speed */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={cn("text-lg font-semibold", status.color)}>
                  {networkInfo.online ? (networkInfo.supported ? status.text : 'Online') : 'Offline'}
                </span>
                {networkInfo.saveData && (
                  <span className="text-xs bg-orange-100 text-orange-700 px-1 rounded">
                    Save Data
                  </span>
                )}
              </div>
              {networkInfo.online && networkInfo.downlink && (
                <span className={cn("text-xs font-medium", speedCategory.color)}>
                  {speedCategory.text}
                </span>
              )}
            </div>

            {/* Speed and Latency */}
            {networkInfo.online && networkInfo.supported && (
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  Speed: <span className="tabular-nums">{formatSpeed()}</span>
                </span>
                <span>
                  Latency: <span className="tabular-nums">{formatLatency()}</span>
                </span>
              </div>
            )}

            {/* API Support Status */}
            {networkInfo.online && !networkInfo.supported && (
              <div className="text-xs text-muted-foreground text-center">
                Network API not supported
              </div>
            )}

            {/* Offline State */}
            {!networkInfo.online && (
              <div className="text-center py-1">
                <div className="text-xs text-muted-foreground">
                  No internet connection
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Wifi className="h-4 w-4 animate-pulse" />
              <span className="text-xs">Checking connection...</span>
            </div>
          </div>
        )}
      </div>
    </BaseWidget>
  );
} 