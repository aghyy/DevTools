import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BaseWidgetProps {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  onRemove?: () => void;
  className?: string;
}

export default function BaseWidget({ title, icon, children, onRemove, className }: BaseWidgetProps) {
  const { theme, systemTheme } = useTheme();
  const resolvedTheme = theme === 'system' ? systemTheme : theme;
  const isDark = resolvedTheme === 'dark';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      className={cn("group h-44", className)}
    >
      <Card className={cn(
        "border shadow-sm hover:shadow-md transition-all duration-200 relative h-full",
        isDark ? "bg-primary/5" : "bg-primary/5"
      )}>
        {onRemove && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="absolute -top-2 -right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 hover:bg-red-500/90 text-destructive-foreground rounded-full z-10"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
        <CardContent className="p-3 h-full flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <div className="text-primary/70">
              {icon}
            </div>
            <h3 className="text-sm font-medium text-foreground/80">{title}</h3>
          </div>
          <div className="text-sm flex-1 flex items-center">
            {children}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
} 