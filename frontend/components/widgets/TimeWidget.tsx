import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import BaseWidget from "./BaseWidget";

interface TimeWidgetProps {
  onRemove?: () => void;
}

export default function TimeWidget({ onRemove }: TimeWidgetProps) {
  const [timeInfo, setTimeInfo] = useState<{
    time: string;
    date: string;
    timezone: string;
  }>({
    time: '',
    date: '',
    timezone: ''
  });

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const time = now.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      const date = now.toLocaleDateString([], {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone.split('/').pop() || 'Local';

      setTimeInfo({ time, date, timezone });
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <BaseWidget
      title="Time"
      icon={<Clock className="h-4 w-4" />}
      onRemove={onRemove}
    >
      <div className="flex items-end justify-between w-full h-full">
        <div className="flex flex-col">
          <span className="font-mono text-sm font-bold text-foreground leading-tight">
            {timeInfo.time}
          </span>
          <span className="text-xs text-muted-foreground leading-tight">
            {timeInfo.date}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          {timeInfo.timezone}
        </span>
      </div>
    </BaseWidget>
  );
}