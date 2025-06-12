"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface RegexExplainerProps {
  pattern: string;
  className?: string;
}

export const RegexExplainer: React.FC<RegexExplainerProps> = ({ 
  pattern,
  className 
}) => {
  if (!pattern) {
    return null;
  }

  // Function to explain the regex pattern
  const explainRegex = (regex: string) => {
    const explanation: string[] = [];
    
    // Remove any regex delimiters and flags if present
    let cleanRegex = regex;
    const flagsMatch = regex.match(/\/([gimsuxy]*)$/);
    let flags = "";
    
    if (regex.startsWith('/') && flagsMatch) {
      flags = flagsMatch[1];
      cleanRegex = regex.slice(1, regex.lastIndexOf('/'));
    }
    
    // Add explanation for flags if present
    if (flags) {
      const flagsExplanation: string[] = [];
      if (flags.includes('g')) flagsExplanation.push('global search (find all matches)');
      if (flags.includes('i')) flagsExplanation.push('case-insensitive search');
      if (flags.includes('m')) flagsExplanation.push('multi-line search (^ and $ match start/end of line)');
      if (flags.includes('s')) flagsExplanation.push('dot (.) matches newlines');
      if (flags.includes('u')) flagsExplanation.push('Unicode support');
      if (flags.includes('y')) flagsExplanation.push('sticky search (match at current position)');
      if (flags.includes('x')) flagsExplanation.push('extended mode (ignores whitespace)');
      
      explanation.push(`<span class="font-semibold">Flags:</span> ${flagsExplanation.join(', ')}`);
    }

    // Basic pattern explanation
    if (cleanRegex.startsWith('^')) {
      explanation.push('Matches the start of the string');
      cleanRegex = cleanRegex.substring(1);
    }
    
    if (cleanRegex.endsWith('$')) {
      explanation.push('Matches the end of the string');
      cleanRegex = cleanRegex.slice(0, -1);
    }
    
    // Look for character classes
    if (/\\d/.test(cleanRegex)) {
      explanation.push('<span class="font-semibold">\\d</span>: Matches any digit (0-9)');
    }
    
    if (/\\w/.test(cleanRegex)) {
      explanation.push('<span class="font-semibold">\\w</span>: Matches any word character (alphanumeric + underscore)');
    }
    
    if (/\\s/.test(cleanRegex)) {
      explanation.push('<span class="font-semibold">\\s</span>: Matches any whitespace character');
    }
    
    // Look for quantifiers
    if (/\*/.test(cleanRegex)) {
      explanation.push('<span class="font-semibold">*</span>: Matches 0 or more of the preceding token');
    }
    
    if (/\+/.test(cleanRegex)) {
      explanation.push('<span class="font-semibold">+</span>: Matches 1 or more of the preceding token');
    }
    
    if (/\?/.test(cleanRegex)) {
      explanation.push('<span class="font-semibold">?</span>: Matches 0 or 1 of the preceding token (makes it optional)');
    }
    
    // Look for groups and alternation
    if (/\(.*\)/.test(cleanRegex)) {
      explanation.push('<span class="font-semibold">( )</span>: Capturing group');
    }
    
    if (/\|/.test(cleanRegex)) {
      explanation.push('<span class="font-semibold">|</span>: Alternation (OR operator)');
    }
    
    // Look for character sets
    if (/\[.*\]/.test(cleanRegex)) {
      explanation.push('<span class="font-semibold">[ ]</span>: Character set - matches any one character in the set');
    }
    
    // Look for negated character sets
    if (/\[\^.*\]/.test(cleanRegex)) {
      explanation.push('<span class="font-semibold">[^ ]</span>: Negated character set - matches any character NOT in the set');
    }

    // If no specific explanation was found
    if (explanation.length === 0) {
      return "This pattern matches specific text literally.";
    }
    
    return explanation.join('<br />');
  };

  return (
    <div 
      className={cn("text-sm p-4 bg-primary/5 rounded-md", className)}
      dangerouslySetInnerHTML={{ __html: explainRegex(pattern) }}
    />
  );
}; 