"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface RegexHighlighterProps {
  pattern: string;
  className?: string;
}

export const RegexHighlighter: React.FC<RegexHighlighterProps> = ({
  pattern,
  className,
}) => {
  // Function to highlight regex syntax
  const highlightRegex = (regex: string) => {
    if (!regex) return "";

    // Replace with appropriate spans for different regex components
    // This is a simple implementation - can be extended for more complex highlighting
    return regex
      // Escape brackets
      .replace(/(\(|\)|\[|\]|\{|\})/g, '<span class="text-yellow-500">$1</span>')
      // Escape special characters
      .replace(
        /(\^|\$|\.|\\|\*|\+|\?|\|)/g,
        '<span class="text-green-500">$1</span>'
      )
      // Escape character classes
      .replace(
        /\\([dDwWsStrnvf])/g,
        '\\<span class="text-purple-500">$1</span>'
      )
      // Escape quantifiers
      .replace(
        /(\{\d+,?\d*\})/g,
        '<span class="text-blue-500">$1</span>'
      )
      // Escape flags
      .replace(
        /\/([gimuy]+)$/g,
        '/<span class="text-pink-500">$1</span>'
      );
  };

  return (
    <div 
      className={cn("font-mono text-sm p-2 bg-primary/5 rounded-md", className)}
      dangerouslySetInnerHTML={{ __html: highlightRegex(pattern) }}
    />
  );
}; 