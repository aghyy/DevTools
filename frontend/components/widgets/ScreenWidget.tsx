import { useEffect, useState } from "react";
import { Monitor, Smartphone, Tablet, Tv } from "lucide-react";
import BaseWidget from "./BaseWidget";
import { cn } from "@/lib/utils";

interface ScreenWidgetProps {
  onRemove?: () => void;
}

export default function ScreenWidget({ onRemove }: ScreenWidgetProps) {
  const [screenInfo, setScreenInfo] = useState<{
    width: number;
    height: number;
    colorDepth: number;
    pixelRatio: number;
    orientation: string;
    supported: boolean;
    loading: boolean;
  }>({
    width: 0,
    height: 0,
    colorDepth: 0,
    pixelRatio: 1,
    orientation: 'unknown',
    supported: false,
    loading: true
  });

  useEffect(() => {
    const updateScreenInfo = () => {
      if (typeof window !== 'undefined' && screen) {
        const orientation = screen.orientation?.type || 
          (window.innerWidth > window.innerHeight ? 'landscape' : 'portrait');
        
        setScreenInfo({
          width: screen.width,
          height: screen.height,
          colorDepth: screen.colorDepth,
          pixelRatio: window.devicePixelRatio || 1,
          orientation: orientation.includes('landscape') ? 'Landscape' : 'Portrait',
          supported: true,
          loading: false
        });
      } else {
        setScreenInfo(prev => ({ ...prev, supported: false, loading: false }));
      }
    };

    updateScreenInfo();

    // Listen for orientation changes
    const handleOrientationChange = () => {
      setTimeout(updateScreenInfo, 100); // Small delay to ensure screen dimensions are updated
    };

    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleOrientationChange);

    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('resize', handleOrientationChange);
    };
  }, []);

  const getScreenIcon = () => {
    if (screenInfo.loading) {
      return <Monitor className="h-4 w-4 animate-pulse" />;
    }
    
    const { width, height } = screenInfo;
    const minDimension = Math.min(width, height);
    const maxDimension = Math.max(width, height);
    
    // Determine device type based on screen size
    if (minDimension < 768) {
      return <Smartphone className="h-4 w-4" />;
    } else if (minDimension < 1024) {
      return <Tablet className="h-4 w-4" />;
    } else if (maxDimension >= 1920) {
      return <Tv className="h-4 w-4" />;
    }
    return <Monitor className="h-4 w-4" />;
  };

  const getScreenCategory = () => {
    if (screenInfo.loading) return { color: "text-muted-foreground", text: "Loading..." };
    if (!screenInfo.supported) return { color: "text-muted-foreground", text: "Not supported" };
    
    const { width, height } = screenInfo;
    const minDimension = Math.min(width, height);
    const totalPixels = width * height;
    
    // Categorize by resolution quality
    if (totalPixels >= 8294400) return { color: "text-emerald-500", text: "4K+" }; // 4K (3840×2160)
    if (totalPixels >= 2073600) return { color: "text-blue-500", text: "QHD" }; // 1440p (2560×1440)
    if (totalPixels >= 1920000) return { color: "text-green-500", text: "FHD" }; // 1080p (1920×1080)
    if (totalPixels >= 1366768) return { color: "text-yellow-500", text: "HD+" }; // 1366×768
    if (minDimension >= 768) return { color: "text-orange-500", text: "HD" }; // 1024×768
    return { color: "text-red-500", text: "SD" }; // Below HD
  };

  const getPixelDensity = () => {
    const { pixelRatio } = screenInfo;
    if (pixelRatio >= 3) return { color: "text-emerald-500", text: "Retina 3x" };
    if (pixelRatio >= 2) return { color: "text-blue-500", text: "Retina 2x" };
    if (pixelRatio > 1) return { color: "text-yellow-500", text: "High DPI" };
    return { color: "text-muted-foreground", text: "Standard" };
  };

  const formatResolution = () => {
    return `${screenInfo.width} × ${screenInfo.height}`;
  };

  const status = getScreenCategory();
  const density = getPixelDensity();

  return (
    <BaseWidget
      title="Screen"
      icon={getScreenIcon()}
      onRemove={onRemove}
    >
      <div className="w-full space-y-2">
        {screenInfo.supported && !screenInfo.loading ? (
          <>
            {/* Resolution and Category */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={cn("text-lg font-semibold tabular-nums", status.color)}>
                  {formatResolution()}
                </span>
              </div>
              <span className={cn("text-xs font-medium", status.color)}>
                {status.text}
              </span>
            </div>

            {/* Orientation and Pixel Ratio */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {screenInfo.orientation}
              </span>
              <span className={density.color}>
                {density.text}
              </span>
            </div>

            {/* Color Depth and Pixel Ratio Details */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {screenInfo.colorDepth}-bit color
              </span>
              <span className="tabular-nums">
                {screenInfo.pixelRatio.toFixed(1)}× pixel ratio
              </span>
            </div>

            {/* Additional Screen Info */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Total pixels</span>
                <span className="tabular-nums">
                  {(screenInfo.width * screenInfo.height / 1000000).toFixed(1)}MP
                </span>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-1">
            {screenInfo.loading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Monitor className="h-4 w-4 animate-pulse" />
                <span className="text-xs">Loading...</span>
              </div>
            ) : (
              <div className="text-center">
                <Monitor className="h-5 w-5 text-muted-foreground/50 mx-auto mb-1" />
                <span className="text-xs text-muted-foreground">
                  Screen API not available
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </BaseWidget>
  );
} 