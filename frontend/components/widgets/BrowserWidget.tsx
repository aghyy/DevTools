import { useEffect, useState } from "react";
import { Globe } from "lucide-react";
import BaseWidget from "./BaseWidget";

interface BrowserWidgetProps {
  onRemove?: () => void;
}

export default function BrowserWidget({ onRemove }: BrowserWidgetProps) {
  const [browserInfo, setBrowserInfo] = useState<string>("");

  useEffect(() => {
    const userAgent = navigator.userAgent;
    const browser = userAgent.includes('Chrome') ? 'Chrome' :
                   userAgent.includes('Firefox') ? 'Firefox' :
                   userAgent.includes('Safari') ? 'Safari' :
                   userAgent.includes('Edge') ? 'Edge' : 'Unknown';
    
    setBrowserInfo(browser);
  }, []);

  return (
    <BaseWidget
      title="Browser"
      icon={<Globe className="h-4 w-4" />}
      onRemove={onRemove}
    >
      <div className="flex flex-col gap-1">
        <span className="font-medium text-foreground">{browserInfo}</span>
        <span className="text-xs text-muted-foreground">
          {navigator.platform}
        </span>
      </div>
    </BaseWidget>
  );
} 