import { useEffect, useState } from "react";
import { Wifi, WifiOff, Signal } from "lucide-react";
import BaseWidget from "./BaseWidget";

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
    supported: boolean;
  }>({
    online: navigator.onLine,
    effectiveType: 'unknown',
    downlink: null,
    supported: false
  });

  useEffect(() => {
    const nav = navigator as NavigatorWithConnection;
    const connection = nav.connection || nav.mozConnection || nav.webkitConnection;

    const updateNetworkInfo = () => {
      setNetworkInfo({
        online: navigator.onLine,
        effectiveType: connection?.effectiveType || 'unknown',
        downlink: connection?.downlink || null,
        supported: !!connection
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
    if (!networkInfo.online) {
      return <WifiOff className="h-4 w-4" />;
    }
    if (networkInfo.supported) {
      return <Signal className="h-4 w-4" />;
    }
    return <Wifi className="h-4 w-4" />;
  };

  const getConnectionQuality = () => {
    switch (networkInfo.effectiveType) {
      case 'slow-2g':
        return { text: 'Slow 2G', color: 'text-red-500' };
      case '2g':
        return { text: '2G', color: 'text-orange-500' };
      case '3g':
        return { text: '3G', color: 'text-yellow-500' };
      case '4g':
        return { text: '4G', color: 'text-green-500' };
      default:
        return { text: 'Unknown', color: 'text-muted-foreground' };
    }
  };

  const quality = getConnectionQuality();

  return (
    <BaseWidget
      title="Network"
      icon={getNetworkIcon()}
      onRemove={onRemove}
    >
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between gap-1">
          <span className={`font-medium ${networkInfo.online ? 'text-green-500' : 'text-red-500'}`}>
            {networkInfo.online ? 'Online' : 'Offline'}
          </span>
          {networkInfo.supported && networkInfo.online && (
            <span className={`text-xs ${quality.color}`}>
              {quality.text}
            </span>
          )}
        </div>
        {networkInfo.supported && networkInfo.downlink && networkInfo.online && (
          <span className="text-xs text-muted-foreground">
            {networkInfo.downlink.toFixed(1)} Mbps
          </span>
        )}
        {!networkInfo.supported && networkInfo.online && (
          <span className="text-xs text-muted-foreground">
            Network API not supported
          </span>
        )}
      </div>
    </BaseWidget>
  );
} 