import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { getAvailableWidgets, addWidget, AvailableWidget } from "@/services/widgetService";
import { toast } from "sonner";
import * as Icons from "lucide-react";

interface WidgetSelectorProps {
  onWidgetAdded: () => void;
  currentWidgetCount: number;
}

export default function WidgetSelector({ onWidgetAdded, currentWidgetCount }: WidgetSelectorProps) {
  const [availableWidgets, setAvailableWidgets] = useState<AvailableWidget[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAvailableWidgets = async () => {
      const widgets = await getAvailableWidgets();
      setAvailableWidgets(widgets);
    };

    if (isOpen) {
      fetchAvailableWidgets();
    }
  }, [isOpen]);

  const handleAddWidget = async (widgetType: string) => {
    if (currentWidgetCount >= 5) {
      toast.error("Maximum of 5 widgets allowed");
      return;
    }

    setLoading(true);
    const success = await addWidget(widgetType);
    setLoading(false);

    if (success) {
      setIsOpen(false);
      onWidgetAdded();
    }
  };

  const getIcon = (iconName: string) => {
    try {
      const IconComponent = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[iconName];
      return IconComponent ? <IconComponent className="h-5 w-5" /> : <Plus className="h-5 w-5" />;
    } catch {
      return <Plus className="h-5 w-5" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          disabled={currentWidgetCount >= 5}
          className="h-8"
        >
          <Plus className="h-4 w-4" />
          Add Widget
          {currentWidgetCount >= 5 && " (Max 5)"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Widget</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
          {availableWidgets.map((widget) => (
            <Card 
              key={widget.type}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleAddWidget(widget.type)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="text-primary/70 mt-0.5">
                    {getIcon(widget.icon)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-sm mb-1">{widget.name}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {widget.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        {loading && (
          <div className="text-center text-sm text-muted-foreground">
            Adding widget...
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
} 