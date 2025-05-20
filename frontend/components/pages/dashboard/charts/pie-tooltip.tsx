import { TooltipProps } from '@/types/charts';

export default function PieTooltip({ active, payload }: TooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className='bg-neutral-100 dark:bg-neutral-900 text-primary py-2 px-3 border border-primary/20 rounded-md min-w-[100px] backdrop-blur-sm shadow-md text-sm'>
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