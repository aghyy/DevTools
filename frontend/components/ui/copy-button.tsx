import React from "react";
import { Copy, ClipboardCopy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { handleCopy } from "@/utils/clipboard";

interface CopyButtonProps {
  value: string;
  variant?: "icon" | "button" | "small-icon";
  size?: "sm" | "lg" | "icon" | "default";
  disabled?: boolean;
  className?: string;
  tooltip?: string;
  children?: React.ReactNode;
}

export function CopyButton({
  value,
  variant = "icon",
  size = "sm",
  disabled = false,
  className = "",
  tooltip = "Copy",
  children
}: CopyButtonProps) {
  const onCopy = () => handleCopy(value);
  const content = children || (
    <>
      {variant === "small-icon" ? (
        <ClipboardCopy className="h-3 w-3" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
      {variant === "button" && <span className="ml-2">Copy</span>}
    </>
  );

  if (variant === "small-icon") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <span>
              <div
                onClick={onCopy}
                className={`p-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-[hsl(var(--secondary-hover))] border cursor-pointer ${className}`}
              >
                <ClipboardCopy className="h-3 w-3" />
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
      variant={variant === "button" ? "outline" : "outline"}
      size={size}
      onClick={onCopy}
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