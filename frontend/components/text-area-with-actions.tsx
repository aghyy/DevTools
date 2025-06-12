import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { CopyButton } from "@/components/ui/copy-button";
import { PasteButton } from "@/components/ui/paste-button";

interface TextAreaWithActionsProps {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  additionalClasses?: string;
}

export const TextAreaWithActions: React.FC<TextAreaWithActionsProps> = ({
  id,
  label,
  placeholder,
  value,
  onChange,
  additionalClasses = "",
}) => {
  // Create a setState-like function for the paste button
  const handlePasteValue = React.useCallback((newValue: React.SetStateAction<string>) => {
    if (typeof newValue === 'function') {
      onChange(newValue(value));
    } else {
      onChange(newValue);
    }
  }, [onChange, value]);

  return (
    <div className={`flex flex-col flex-1 gap-3 relative ${additionalClasses}`}>
      <div className="flex justify-between">
        <label htmlFor={id} className="block text-lg font-semibold">
          {label}
        </label>
        <div className="flex gap-2">
          <CopyButton value={value} variant="small-icon" />
          <PasteButton onPaste={handlePasteValue} variant="small-icon" />
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