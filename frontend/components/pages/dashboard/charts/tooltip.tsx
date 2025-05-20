import { TooltipProps } from "@/types/charts";

export default function Tooltip({ active, payload, label }: TooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-neutral-100 dark:bg-neutral-900 text-primary py-2 px-3 border border-primary/20 rounded-md min-w-[100px] backdrop-blur-sm shadow-md text-sm">
        <p className="font-medium">{label || ''}</p>
        {payload.map((entry, index) => {
          // Format response time values with 2 decimal places
          const displayValue = entry.name === "Response Time" && typeof entry.value === 'number'
            ? parseFloat(entry.value.toString()).toFixed(2)
            : entry.value;

          return (
            <div key={`tooltip-${index}`} className="flex items-center justify-between mt-1">
              <span className="mr-2">{entry.name || 'Value'}:</span>
              <span className="font-semibold" style={{ color: entry.color }}>{displayValue}{entry.unit}</span>
            </div>
          );
        })}
      </div>
    );
  }

  return null;
};