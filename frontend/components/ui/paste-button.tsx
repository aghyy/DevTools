import React from "react";
import { ClipboardPaste } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { handlePaste } from "@/utils/clipboard";

interface PasteButtonProps {
  onPaste: React.Dispatch<React.SetStateAction<string>>;
  variant?: "icon" | "button" | "small-icon";
  size?: "sm" | "lg" | "icon" | "default";
  disabled?: boolean;
  className?: string;
  tooltip?: string;
  children?: React.ReactNode;
}

export function PasteButton({
  onPaste,
  variant = "icon",
  size = "sm",
  disabled = false,
  className = "",
  tooltip = "Paste",
  children
}: PasteButtonProps) {
  const handlePasteClick = () => handlePaste(onPaste);
  const content = children || (
    <>
      <ClipboardPaste className="h-3 w-3" />
      {variant === "button" && <span className="ml-2">Paste</span>}
    </>
  );

  if (variant === "small-icon") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <span>
              <div
                onClick={handlePasteClick}
                className={`p-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-[hsl(var(--secondary-hover))] border cursor-pointer ${className}`}
              >
                <ClipboardPaste className="h-3 w-3" />
              </div>
            </span>
          </TooltipTrigger>
          <TooltipContent>{tooltip}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  const buttonContent = (
    <Button
      variant="outline"
      size={size}
      onClick={handlePasteClick}
      disabled={disabled}
      className={className}
    >
      {content}
    </Button>
  );

  if (tooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {buttonContent}
          </TooltipTrigger>
          <TooltipContent>{tooltip}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return buttonContent;
}