import { useTheme } from "next-themes";
import { TooltipProps } from "@/types/charts";

export default function Tooltip({ active, payload, label, style }: TooltipProps) {
  const { theme, systemTheme } = useTheme();
  const resolvedTheme = theme === 'system' ? systemTheme : theme;
  const isDark = resolvedTheme === 'dark';

  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip" style={{
        backgroundColor: style?.backgroundColor || isDark ? '#000' : '#fff',
        color: style?.color || isDark ? '#fff' : '#000',
        padding: '8px 12px',
        border: `1px solid ${style?.borderColor || '#374151'}`,
        borderRadius: '6px',
        boxShadow: '0px 4px 10px rgba(0,0,0,0.2)',
        fontSize: '12px',
        minWidth: '120px',
        backdropFilter: 'blur(4px)',
      }}>
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