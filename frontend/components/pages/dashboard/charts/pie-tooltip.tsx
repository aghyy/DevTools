import { useTheme } from 'next-themes';
import { TooltipProps } from '@/types/charts';

export default function PieTooltip({ active, payload }: TooltipProps) {
  const { theme, systemTheme } = useTheme();
  const resolvedTheme = theme === 'system' ? systemTheme : theme;
  const isDark = resolvedTheme === 'dark';

  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip" style={{
        backgroundColor: isDark ? '#000' : '#fff',
        color: isDark ? '#fff' : '#000',
        padding: '8px 12px',
        border: '1px solid #374151',
        borderRadius: '6px',
        boxShadow: '0px 4px 10px rgba(0,0,0,0.2)',
        fontSize: '12px',
        minWidth: '100px',
        backdropFilter: 'blur(4px)',
      }}>
        <p className="font-medium">{payload[0].name || ''}</p>
        <div className="flex items-center justify-between mt-1">
          <span style={{ color: payload[0].payload?.fill }}>Uses:</span>
          <span className="font-semibold">{payload[0].value}</span>
        </div>
      </div>
    );
  }

  return null;
};