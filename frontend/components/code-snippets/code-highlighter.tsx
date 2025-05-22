"use client";

import React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  vscDarkPlus,
  vs,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

interface CodeHighlighterProps {
  code: string;
  language: string;
  className?: string;
  showLineNumbers?: boolean;
}

export const CodeHighlighter: React.FC<CodeHighlighterProps> = ({
  code,
  language,
  className,
  showLineNumbers = true,
}) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // Map common language names to ones that react-syntax-highlighter supports
  const getSyntaxHighlighterLanguage = (lang: string): string => {
    const languageMap: Record<string, string> = {
      "c++": "cpp",
      "c#": "csharp",
      js: "javascript",
      ts: "typescript",
      py: "python",
      sh: "bash",
      shell: "bash",
      yml: "yaml",
    };

    return languageMap[lang.toLowerCase()] || lang.toLowerCase();
  };

  return (
    <div className={cn("rounded-md overflow-hidden", className)}>
      <SyntaxHighlighter
        language={getSyntaxHighlighterLanguage(language)}
        style={isDark ? vscDarkPlus : vs}
        showLineNumbers={showLineNumbers}
        wrapLines
        wrapLongLines
        customStyle={{
          margin: 0,
          fontSize: "0.9rem",
          borderRadius: "0.5rem",
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}; 