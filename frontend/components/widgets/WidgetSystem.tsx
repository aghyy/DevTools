import { useEffect, useState } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { getUserWidgets, updateUserWidgets, removeWidget, Widget } from "@/services/widgetService";
import MemoryWidget from "./MemoryWidget";
import BatteryWidget from "./BatteryWidget";
import LocationWidget from "./LocationWidget";
import ScreenWidget from "./ScreenWidget";
import DeviceWidget from "./DeviceWidget";
import NetworkWidget from "./NetworkWidget";
import WidgetSelector from "./WidgetSelector";

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
      case 'memory':
        return <MemoryWidget key={widget.id} onRemove={onRemove} />;
      case 'battery':
        return <BatteryWidget key={widget.id} onRemove={onRemove} />;
      case 'location':
        return <LocationWidget key={widget.id} onRemove={onRemove} />;
      case 'network':
        return <NetworkWidget key={widget.id} onRemove={onRemove} />;
      case 'device':
        return <DeviceWidget key={widget.id} onRemove={onRemove} />;
      case 'screen':
        return <ScreenWidget key={widget.id} onRemove={onRemove} />;
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-44 bg-muted rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 10,
      scale: 0.98
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };

  return (
    <div className={className}>
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
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <Reorder.Group
            axis="x"
            values={widgets}
            onReorder={handleReorder}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3"
          >
            <AnimatePresence mode="popLayout">
              {widgets.map((widget) => (
                <motion.div
                  key={widget.id}
                  variants={itemVariants}
                >
                  <Reorder.Item
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
                </motion.div>
              ))}
            </AnimatePresence>
          </Reorder.Group>
        </motion.div>
      )}

      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {widgets.length}/5 widgets
          </span>
        </div>
        <WidgetSelector
          currentWidgetCount={widgets.length}
          onWidgetAdded={handleWidgetAdded}
        />
      </div>
    </div>
  );
}