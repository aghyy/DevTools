"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";

import { CopyButton } from "@/components/ui/copy-button";
import { PasteButton } from "@/components/ui/paste-button";
import { useClientToolPerformance } from "@/utils/performanceTracker";
import { ClientToolTracker } from "@/components/client-tool-tracker";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import FavoriteButton from "@/components/favorite-button";

interface JSONError {
  line: number;
  column: number;
  message: string;
}

export default function JSONFormatterPage() {
  return (
    <ClientToolTracker name="JSON Formatter" icon="Braces" trackInitialLoad={false}>
      <JSONFormatter />
    </ClientToolTracker>
  );
}

// Enhanced textarea component with line numbers and auto-completion
function CodeEditor({
  value,
  onChange,
  placeholder,
  readOnly = false,
  error = null,
  label = "",
  showCopyPaste = false
}: {
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  error?: JSONError | null;
  label?: string;
  showCopyPaste?: boolean;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const lines = value.split('\n');
  const lineCount = Math.max(lines.length, 1);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (readOnly) return;

    const textarea = e.target as HTMLTextAreaElement;
    const { selectionStart, selectionEnd } = textarea;

    // Auto-completion for brackets
    const pairs: Record<string, string> = {
      '{': '}',
      '[': ']',
      '"': '"',
      '(': ')'
    };

    if (pairs[e.key]) {
      e.preventDefault();
      const before = value.substring(0, selectionStart);
      const after = value.substring(selectionEnd);
      const newValue = before + e.key + pairs[e.key] + after;

      if (onChange) {
        onChange(newValue);
      }

      // Set cursor position between the brackets
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.setSelectionRange(selectionStart + 1, selectionStart + 1);
        }
      }, 0);
    } else if (e.key === 'Enter') {
      // Auto-indent on new line
      e.preventDefault();
      const before = value.substring(0, selectionStart);
      const after = value.substring(selectionEnd);
      const currentLine = before.split('\n').pop() || '';
      const indent = currentLine.match(/^(\s*)/)?.[1] || '';

      // Add extra indent if the previous line ends with { or [
      const extraIndent = currentLine.trim().endsWith('{') || currentLine.trim().endsWith('[') ? '  ' : '';

      const newValue = before + '\n' + indent + extraIndent + after;

      if (onChange) {
        onChange(newValue);
      }

      setTimeout(() => {
        if (textareaRef.current) {
          const newPosition = selectionStart + 1 + indent.length + extraIndent.length;
          textareaRef.current.setSelectionRange(newPosition, newPosition);
        }
      }, 0);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const before = value.substring(0, selectionStart);
      const after = value.substring(selectionEnd);
      const newValue = before + '  ' + after;

      if (onChange) {
        onChange(newValue);
      }

      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.setSelectionRange(selectionStart + 2, selectionStart + 2);
        }
      }, 0);
    }
  }, [value, onChange, readOnly]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (onChange) {
      onChange(e.target.value);
    }
  }, [onChange]);

  // Create a setState-like function for the paste button
  const handlePasteValue = useCallback((newValue: React.SetStateAction<string>) => {
    if (onChange) {
      if (typeof newValue === 'function') {
        onChange(newValue(value));
      } else {
        onChange(newValue);
      }
    }
  }, [onChange, value]);

  return (
    <div className="flex flex-col gap-3">
      {/* Header with label and copy/paste buttons */}
      {(label || showCopyPaste) && (
        <div className="flex justify-between items-center">
          {label && (
            <label className="block text-lg font-semibold">{label}</label>
          )}
          {showCopyPaste && (
            <div className="flex gap-2">
              <CopyButton value={value} variant="small-icon" />
              <PasteButton onPaste={handlePasteValue} variant="small-icon" />
            </div>
          )}
        </div>
      )}

      {/* Code editor */}
      <div className="relative border rounded-md overflow-hidden bg-background">
        {/* Line numbers */}
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-muted/30 border-r flex flex-col text-xs text-muted-foreground font-mono select-none">
          {Array.from({ length: lineCount }, (_, i) => (
            <div
              key={i + 1}
              className={`px-2 py-0 leading-6 text-right ${error && error.line === i + 1 ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : ''
                }`}
            >
              {i + 1}
            </div>
          ))}
        </div>

        {/* Code input */}
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          readOnly={readOnly}
          className={`pl-14 pr-4 py-2 border-0 resize-none font-mono text-sm leading-6 min-h-[240px] focus-visible:ring-0 ${error ? 'bg-red-50 dark:bg-red-950/20' : ''
            }`}
          spellCheck={false}
        />

        {/* Error indicator */}
        {error && (
          <div className="absolute top-2 right-2">
            <XCircle className="h-4 w-4 text-red-500" />
          </div>
        )}
      </div>
    </div>
  );
}

function JSONFormatter() {
  const router = useRouter();
  const { trackOperation } = useClientToolPerformance('json-formatter');
  const formatTracker = useRef<{ complete: () => void } | null>(null);

  const routeTo = (path: string) => {
    router.push(path);
  }

  const [jsonInput, setJsonInput] = useState('');
  const [validationStatus, setValidationStatus] = useState<'valid' | 'invalid' | null>(null);
  const [jsonError, setJsonError] = useState<JSONError | null>(null);

  // Parse JSON error to extract line and column information
  const parseJSONError = (error: Error, input: string): JSONError => {
    const message = error.message;

    // Try to extract position from different error message formats
    let line = 1;
    let column = 1;

    // Chrome/V8 format: "Unexpected token } in JSON at position 123"
    const positionMatch = message.match(/at position (\d+)/);
    if (positionMatch) {
      const position = parseInt(positionMatch[1]);
      const lines = input.substring(0, position).split('\n');
      line = lines.length;
      column = lines[lines.length - 1].length + 1;
    }

    // Firefox format: "JSON.parse: unexpected character at line 2 column 3"
    const lineColumnMatch = message.match(/line (\d+) column (\d+)/);
    if (lineColumnMatch) {
      line = parseInt(lineColumnMatch[1]);
      column = parseInt(lineColumnMatch[2]);
    }

    // Extract specific error type
    let errorMessage = message;
    if (message.includes('Unexpected token')) {
      const tokenMatch = message.match(/Unexpected token (.+?) /);
      if (tokenMatch) {
        errorMessage = `Unexpected token '${tokenMatch[1]}'`;
      }
    } else if (message.includes('Unexpected end')) {
      errorMessage = 'Unexpected end of JSON input';
    } else if (message.includes('Expected')) {
      errorMessage = message;
    }

    return { line, column, message: errorMessage };
  };

  const handleFormatJson = () => {
    // Start format tracking
    formatTracker.current = trackOperation('format');

    try {
      const parsedJson = JSON.parse(jsonInput);
      const formatted = JSON.stringify(parsedJson, null, 2);
      setJsonInput(formatted);
      setValidationStatus('valid');
      setJsonError(null);

      // Complete tracking on success
      if (formatTracker.current) {
        formatTracker.current.complete();
        formatTracker.current = null;
      }
    } catch (error) {
      const jsonError = parseJSONError(error as Error, jsonInput);
      setJsonError(jsonError);
      setValidationStatus('invalid');

      // Clear tracker on error
      if (formatTracker.current) {
        formatTracker.current = null;
      }
    }
  }



  const handleClear = () => {
    setJsonInput('');
    setValidationStatus(null);
    setJsonError(null);

    // Clear any active trackers
    if (formatTracker.current) {
      formatTracker.current = null;
    }
  }

  // Auto-validate as user types
  useEffect(() => {
    if (jsonInput.trim()) {
      const timeoutId = setTimeout(() => {
        try {
          JSON.parse(jsonInput);
          setValidationStatus('valid');
          setJsonError(null);
        } catch (error) {
          const jsonError = parseJSONError(error as Error, jsonInput);
          setJsonError(jsonError);
          setValidationStatus('invalid');
        }
      }, 500);

      return () => clearTimeout(timeoutId);
    } else {
      setValidationStatus(null);
      setJsonError(null);
    }
  }, [jsonInput]);

  return (
    <div className="h-full w-full">
      {/* Breadcrumb Navigation */}
      <div className="relative size-0">
        <Breadcrumb className="absolute left-20 top-[22px] w-max">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink className="cursor-pointer" onClick={() => routeTo('/tools')}>Tools</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>JSON Formatter</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Top Spacing */}
      <div className="pt-16"></div>

      {/* Title */}
      <div className="flex items-center justify-center gap-2 my-3">
        <h1 className="text-3xl font-bold my-3 text-center">JSON Formatter & Validator</h1>
        <FavoriteButton
          toolUrl="/tools/json-formatter"
          toolName="JSON Formatter"
          iconName="Braces"
        />
      </div>

      {/* Description */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <p className="text-muted-foreground">
          Advanced JSON formatter with auto-completion, line numbers, and real-time validation.
          Features include bracket auto-completion, smart indentation, and detailed error reporting.
        </p>
      </div>

      <div className="mx-8 mt-8 mb-24 flex flex-col gap-6">
        {/* Input Section */}
        <Card className="transition-all duration-200 hover:shadow-md">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">✍️</span>
                  JSON Input
                  {validationStatus === 'valid' && (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                  {validationStatus === 'invalid' && (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </CardTitle>
                <CardDescription>
                  Enter your JSON here. Auto-completion and validation included.
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleClear}>
                  Clear
                </Button>
                <Button size="sm" onClick={handleFormatJson}>
                  Format
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <CodeEditor
              value={jsonInput}
              onChange={setJsonInput}
              placeholder={`{
  "name": "JSON Formatter",
  "features": [
    "Auto-completion",
    "Line numbers",
    "Error reporting"
  ],
  "version": "2.0"
}`}
              error={jsonError}
              label="JSON Input"
              showCopyPaste={true}
            />
          </CardContent>
        </Card>

        {/* Error Details */}
        {jsonError && validationStatus === 'invalid' && (
          <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-red-700 dark:text-red-400 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                JSON Validation Error
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">Line {jsonError.line}, Column {jsonError.column}:</span>
                  <span className="text-red-600 dark:text-red-400">{jsonError.message}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Check the highlighted line in the editor above for the specific issue.
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Success Status */}
        {validationStatus === 'valid' && !jsonError && (
          <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Valid JSON</span>
                <span className="text-sm text-muted-foreground">Ready to format or copy</span>
              </div>
            </CardContent>
          </Card>
        )}


      </div>
    </div>
  );
}