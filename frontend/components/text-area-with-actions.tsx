import React from "react";
import { ClipboardCopy, ClipboardPaste } from "lucide-react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";

import { Textarea } from "@/components/ui/textarea";

interface TextAreaWithActionsProps {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onCopy: () => void;
  onPaste: () => void;
  additionalClasses?: string;
}

export const TextAreaWithActions: React.FC<TextAreaWithActionsProps> = ({
  id,
  label,
  placeholder,
  value,
  onChange,
  onCopy,
  onPaste,
  additionalClasses = "",
}) => {
  return (
    <div className={`flex flex-col flex-1 gap-3 relative ${additionalClasses}`}>
      <div className="flex justify-between">
        <label htmlFor={id} className="block text-lg font-semibold">
          {label}
        </label>
        <div className="flex gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <span>
                  <div
                    onClick={onCopy}
                    className="p-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-[hsl(var(--secondary-hover))] border"
                  >
                    <ClipboardCopy className="h-3 w-3" />
                  </div>
                </span>
              </TooltipTrigger>
              <TooltipContent>Copy</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger>
                <span>
                  <div
                    onClick={onPaste}
                    className="p-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-[hsl(var(--secondary-hover))] border"
                  >
                    <ClipboardPaste className="h-3 w-3" />
                  </div>
                </span>
              </TooltipTrigger>
              <TooltipContent>Paste</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      <Textarea
        id={id}
        className=""
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      ></Textarea>
    </div>
  );
};