import { useEffect, useState } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { getUserWidgets, updateUserWidgets, removeWidget, Widget } from "@/services/widgetService";
import BrowserWidget from "./BrowserWidget";
import MemoryWidget from "./MemoryWidget";
import BatteryWidget from "./BatteryWidget";
import LocationWidget from "./LocationWidget";
import TimeWidget from "./TimeWidget";
import NetworkWidget from "./NetworkWidget";
import WidgetSelector from "./WidgetSelector";
import { Smartphone, Monitor, Signal } from "lucide-react";
import BaseWidget from "./BaseWidget";

interface WidgetSystemProps {
  className?: string;
}

export default function WidgetSystem({ className }: WidgetSystemProps) {
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWidgets();
  }, []);

  const loadWidgets = async () => {
    setLoading(true);
    const userWidgets = await getUserWidgets();
    setWidgets(userWidgets);
    setLoading(false);
  };

  const handleRemoveWidget = async (widgetId: number) => {
    const success = await removeWidget(widgetId);
    if (success) {
      loadWidgets();
    }
  };

  const handleReorder = async (newWidgets: Widget[]) => {
    // Update positions
    const updatedWidgets = newWidgets.map((widget, index) => ({
      ...widget,
      position: index
    }));
    
    setWidgets(updatedWidgets);
    
    // Save to backend
    const success = await updateUserWidgets(updatedWidgets);
    if (!success) {
      // Revert on failure
      loadWidgets();
    }
  };

  const handleWidgetAdded = () => {
    loadWidgets();
  };

  const renderWidget = (widget: Widget) => {
    const onRemove = widget.id ? () => handleRemoveWidget(widget.id!) : undefined;

    switch (widget.widgetType) {
      case 'browser':
        return <BrowserWidget key={widget.id} onRemove={onRemove} />;
      case 'memory':
        return <MemoryWidget key={widget.id} onRemove={onRemove} />;
      case 'battery':
        return <BatteryWidget key={widget.id} onRemove={onRemove} />;
      case 'location':
        return <LocationWidget key={widget.id} onRemove={onRemove} />;
      case 'time':
        return <TimeWidget key={widget.id} onRemove={onRemove} />;
      case 'network':
        return <NetworkWidget key={widget.id} onRemove={onRemove} />;
      case 'device':
        return (
          <BaseWidget
            key={widget.id}
            title="Device"
            icon={<Smartphone className="h-4 w-4" />}
            onRemove={onRemove}
          >
            <div className="flex flex-col gap-1">
              <span className="font-medium text-foreground">
                {/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop'}
              </span>
              <span className="text-xs text-muted-foreground">
                {navigator.platform}
              </span>
            </div>
          </BaseWidget>
        );
      case 'screen':
        return (
          <BaseWidget
            key={widget.id}
            title="Screen"
            icon={<Monitor className="h-4 w-4" />}
            onRemove={onRemove}
          >
            <div className="flex flex-col gap-1">
              <span className="font-medium text-foreground">
                {screen.width} × {screen.height}
              </span>
              <span className="text-xs text-muted-foreground">
                {screen.colorDepth}-bit color
              </span>
            </div>
          </BaseWidget>
        );
      case 'connection':
        return (
          <BaseWidget
            key={widget.id}
            title="Connection"
            icon={<Signal className="h-4 w-4" />}
            onRemove={onRemove}
          >
            <div className="flex flex-col gap-1">
              <span className={`font-medium ${navigator.onLine ? 'text-green-500' : 'text-red-500'}`}>
                {navigator.onLine ? 'Online' : 'Offline'}
              </span>
              <span className="text-xs text-muted-foreground">
                Connection status
              </span>
            </div>
          </BaseWidget>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className={className}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-muted-foreground">System Widgets</h3>
          <div className="h-8 w-24 bg-muted rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-muted rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {widgets.length}/3 widgets
          </span>
        </div>
        <WidgetSelector
          currentWidgetCount={widgets.length}
          onWidgetAdded={handleWidgetAdded}
        />
      </div>

      {widgets.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-8 text-muted-foreground"
        >
          <p className="text-sm">No widgets added yet.</p>
          <p className="text-xs mt-1">Click &quot;Add Widget&quot; to get started.</p>
        </motion.div>
      ) : (
        <Reorder.Group
          axis="x"
          values={widgets}
          onReorder={handleReorder}
          className="grid grid-cols-1 md:grid-cols-3 gap-3"
        >
          <AnimatePresence mode="popLayout">
            {widgets.map((widget) => (
              <Reorder.Item
                key={widget.id}
                value={widget}
                className="cursor-grab active:cursor-grabbing"
                whileDrag={{ 
                  scale: 1.05, 
                  zIndex: 10,
                  transition: { duration: 0.1 }
                }}
                animate={{ scale: 1 }}
                transition={{ 
                  scale: { duration: 0.2, ease: "easeOut" },
                  layout: { duration: 0.3 }
                }}
                layout
              >
                {renderWidget(widget)}
              </Reorder.Item>
            ))}
          </AnimatePresence>
        </Reorder.Group>
              )}
    </div>
  );
} 