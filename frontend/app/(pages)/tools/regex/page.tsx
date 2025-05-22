"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Copy, Trash } from "lucide-react";

import { TopSpacing } from "@/components/top-spacing";
import { RegexHighlighter } from "@/components/regex/regex-highlighter";
import { RegexExplainer } from "@/components/regex/regex-explainer";
import { handleCopy } from "@/utils/clipboard";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import FavoriteButton from "@/components/favorite-button";

// Regex cheat sheets by language
const cheatSheets = {
  javascript: [
    { pattern: "/pattern/g", description: "Global search" },
    { pattern: "/pattern/i", description: "Case-insensitive search" },
    { pattern: "/pattern/m", description: "Multi-line search" },
    { pattern: "\\d", description: "Any digit (0-9)" },
    { pattern: "\\w", description: "Any word character (a-z, A-Z, 0-9, _)" },
    { pattern: "\\s", description: "Any whitespace character" },
    { pattern: "[abc]", description: "Any character from the set (a, b, or c)" },
    { pattern: "[^abc]", description: "Any character NOT in the set" },
    { pattern: "a|b", description: "a OR b" },
    { pattern: "(abc)", description: "Capturing group" },
    { pattern: "(?:abc)", description: "Non-capturing group" },
    { pattern: "a?", description: "Zero or one of a" },
    { pattern: "a*", description: "Zero or more of a" },
    { pattern: "a+", description: "One or more of a" },
    { pattern: "a{3}", description: "Exactly 3 of a" },
    { pattern: "a{3,}", description: "3 or more of a" },
    { pattern: "a{1,3}", description: "Between 1 and 3 of a" },
  ],
  python: [
    { pattern: "r'pattern'", description: "Raw string (recommended for regex)" },
    { pattern: "re.IGNORECASE", description: "Case-insensitive search" },
    { pattern: "re.MULTILINE", description: "Multi-line search" },
    { pattern: "re.DOTALL", description: "Dot matches newlines" },
    { pattern: "\\d", description: "Any digit (0-9)" },
    { pattern: "\\w", description: "Any word character (a-z, A-Z, 0-9, _)" },
    { pattern: "\\s", description: "Any whitespace character" },
    { pattern: "[abc]", description: "Any character from the set (a, b, or c)" },
    { pattern: "[^abc]", description: "Any character NOT in the set" },
    { pattern: "a|b", description: "a OR b" },
    { pattern: "(abc)", description: "Capturing group" },
    { pattern: "(?:abc)", description: "Non-capturing group" },
    { pattern: "(?P<name>abc)", description: "Named capturing group" },
    { pattern: "a?", description: "Zero or one of a" },
    { pattern: "a*", description: "Zero or more of a" },
    { pattern: "a+", description: "One or more of a" },
    { pattern: "a{3}", description: "Exactly 3 of a" },
  ],
  php: [
    { pattern: "/pattern/i", description: "Case-insensitive search" },
    { pattern: "/pattern/m", description: "Multi-line search" },
    { pattern: "/pattern/s", description: "Dot matches newlines" },
    { pattern: "/pattern/x", description: "Extended mode (ignores whitespace)" },
    { pattern: "/pattern/u", description: "Unicode support" },
    { pattern: "\\d", description: "Any digit (0-9)" },
    { pattern: "\\w", description: "Any word character (a-z, A-Z, 0-9, _)" },
    { pattern: "\\s", description: "Any whitespace character" },
    { pattern: "[abc]", description: "Any character from the set (a, b, or c)" },
    { pattern: "[^abc]", description: "Any character NOT in the set" },
    { pattern: "a|b", description: "a OR b" },
    { pattern: "(abc)", description: "Capturing group" },
    { pattern: "(?:abc)", description: "Non-capturing group" },
    { pattern: "(?P<name>abc)", description: "Named capturing group (PCRE)" },
    { pattern: "a?", description: "Zero or one of a" },
    { pattern: "a*", description: "Zero or more of a" },
    { pattern: "a+", description: "One or more of a" },
  ],
  golang: [
    { pattern: "(?i)", description: "Case-insensitive search" },
    { pattern: "(?m)", description: "Multi-line search" },
    { pattern: "(?s)", description: "Dot matches newlines" },
    { pattern: "\\d", description: "Any digit (0-9)" },
    { pattern: "\\w", description: "Any word character (a-z, A-Z, 0-9, _)" },
    { pattern: "\\s", description: "Any whitespace character" },
    { pattern: "[abc]", description: "Any character from the set (a, b, or c)" },
    { pattern: "[^abc]", description: "Any character NOT in the set" },
    { pattern: "a|b", description: "a OR b" },
    { pattern: "(abc)", description: "Capturing group" },
    { pattern: "(?:abc)", description: "Non-capturing group" },
    { pattern: "a?", description: "Zero or one of a" },
    { pattern: "a*", description: "Zero or more of a" },
    { pattern: "a+", description: "One or more of a" },
    { pattern: "a{3}", description: "Exactly 3 of a" },
    { pattern: "a{3,}", description: "3 or more of a" },
    { pattern: "a{1,3}", description: "Between 1 and 3 of a" },
  ],
  java: [
    { pattern: "Pattern.CASE_INSENSITIVE", description: "Case-insensitive search" },
    { pattern: "Pattern.MULTILINE", description: "Multi-line search" },
    { pattern: "Pattern.DOTALL", description: "Dot matches newlines" },
    { pattern: "\\d", description: "Any digit (0-9)" },
    { pattern: "\\w", description: "Any word character (a-z, A-Z, 0-9, _)" },
    { pattern: "\\s", description: "Any whitespace character" },
    { pattern: "\\p{IsDigit}", description: "Unicode digit" },
    { pattern: "[abc]", description: "Any character from the set (a, b, or c)" },
    { pattern: "[^abc]", description: "Any character NOT in the set" },
    { pattern: "a|b", description: "a OR b" },
    { pattern: "(abc)", description: "Capturing group" },
    { pattern: "(?:abc)", description: "Non-capturing group" },
    { pattern: "(?<name>abc)", description: "Named capturing group (Java 7+)" },
    { pattern: "a?", description: "Zero or one of a" },
    { pattern: "a*", description: "Zero or more of a" },
    { pattern: "a+", description: "One or more of a" },
  ],
  csharp: [
    { pattern: "Regex(pattern, RegexOptions.IgnoreCase)", description: "Case-insensitive search" },
    { pattern: "Regex(pattern, RegexOptions.Multiline)", description: "Multi-line search" },
    { pattern: "Regex(pattern, RegexOptions.Singleline)", description: "Dot matches newlines" },
    { pattern: "\\d", description: "Any digit (0-9)" },
    { pattern: "\\w", description: "Any word character (a-z, A-Z, 0-9, _)" },
    { pattern: "\\s", description: "Any whitespace character" },
    { pattern: "[abc]", description: "Any character from the set (a, b, or c)" },
    { pattern: "[^abc]", description: "Any character NOT in the set" },
    { pattern: "a|b", description: "a OR b" },
    { pattern: "(abc)", description: "Capturing group" },
    { pattern: "(?:abc)", description: "Non-capturing group" },
    { pattern: "(?<name>abc)", description: "Named capturing group" },
    { pattern: "a?", description: "Zero or one of a" },
    { pattern: "a*", description: "Zero or more of a" },
    { pattern: "a+", description: "One or more of a" },
  ],
};

type Match = {
  text: string;
  index: number;
  groups: string[];
};

export default function RegexTester() {
  const router = useRouter();
  const [regexPattern, setRegexPattern] = useState<string>('');
  const [testText, setTestText] = useState<string>('');
  const [matches, setMatches] = useState<Match[] | null>(null);
  const [matchPositions, setMatchPositions] = useState<{ start: number, end: number }[]>([]);
  const [error, setError] = useState<string | null>(null);

  const routeTo = (path: string) => {
    router.push(path);
  };

  // Test the regex pattern against the input text
  const testRegex = useCallback(() => {
    setError(null);
    setMatches(null);
    setMatchPositions([]);

    if (!regexPattern) {
      return;
    }

    try {
      let regex: RegExp;
      if (regexPattern.startsWith('/') && regexPattern.lastIndexOf('/') !== 0) {
        // Extract flags if any
        const lastSlashIndex = regexPattern.lastIndexOf('/');
        const pattern = regexPattern.substring(1, lastSlashIndex);
        const flags = regexPattern.substring(lastSlashIndex + 1);
        regex = new RegExp(pattern, flags);
      } else {
        // Treat as a plain pattern without flags
        regex = new RegExp(regexPattern);
      }

      // Get all matches
      const allMatches = Array.from(testText.matchAll(regex));

      // Convert to our Match type
      const formattedMatches: Match[] = allMatches.map(match => ({
        text: match[0],
        index: match.index !== undefined ? match.index : 0,
        groups: Array.from(match).slice(1)
      }));

      setMatches(formattedMatches.length > 0 ? formattedMatches : null);

      // Calculate match positions for highlighting
      const positions: { start: number, end: number }[] = [];
      formattedMatches.forEach(match => {
        positions.push({
          start: match.index,
          end: match.index + match.text.length
        });
      });
      setMatchPositions(positions);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }, [regexPattern, testText]);

  // Test the regex whenever the pattern or text changes
  useEffect(() => {
    if (regexPattern && testText) {
      testRegex();
    } else {
      setMatches(null);
      setMatchPositions([]);
    }
  }, [regexPattern, testText, testRegex]);

  // Highlight matches in the test text
  const highlightMatches = (text: string) => {
    if (!matchPositions.length || !text) return text;

    let result = '';
    let lastIndex = 0;

    // Sort positions to ensure they're processed in order
    const sortedPositions = [...matchPositions].sort((a, b) => a.start - b.start);

    sortedPositions.forEach(({ start, end }) => {
      // Add text before match
      result += text.substring(lastIndex, start);
      // Add matched text with highlight
      result += `<span class="bg-green-200 dark:bg-green-800">${text.substring(start, end)}</span>`;
      lastIndex = end;
    });

    // Add remaining text
    result += text.substring(lastIndex);
    return result;
  };

  const handleClear = () => {
    setRegexPattern('');
    setTestText('');
    setMatches(null);
    setMatchPositions([]);
    setError(null);
  };

  return (
    <div className="h-full w-full">
      <div className="relative size-0">
        <Breadcrumb className="absolute left-20 top-[22px] w-max">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink className="cursor-pointer" onClick={() => routeTo('/tools')}>Tools</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Regex</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <TopSpacing />

      {/* Title */}
      <div className="flex items-center justify-center gap-2 my-3">
        <h1 className="text-3xl font-bold my-3 text-center">Regular Expressions</h1>
        <FavoriteButton
          toolUrl="/tools/regex"
          toolName="Regex"
          iconName="Regex"
        />
      </div>

      {/* Description */}
      <div className="text-center max-w-2xl mx-auto">
        <p className="text-muted-foreground">
          Regular expressions are a powerful way to match patterns in text. They are used in many programming languages, including JavaScript, Python, PHP, and Go.
        </p>
      </div>

      {/* Main Content */}
      <div className="mx-8 mt-8 mb-24 flex flex-col gap-10">
        {/* Regex Pattern Input */}
        <Card>
          <CardHeader>
            <CardTitle>🔍 Regex Pattern</CardTitle>
            <CardDescription>Enter your regular expression pattern</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col space-y-2">
              <Input
                value={regexPattern}
                onChange={(e) => setRegexPattern(e.target.value)}
                placeholder="Enter regex pattern (e.g., /\d+/g)"
                className="font-mono"
              />
              {regexPattern && (
                <div className="flex flex-col gap-2">
                  <div className="text-sm font-medium">Syntax Highlighting:</div>
                  <RegexHighlighter pattern={regexPattern} />
                </div>
              )}
            </div>
            {error && (
              <div className="text-red-500 text-sm p-2 rounded bg-red-50 dark:bg-red-900/20">
                Error: {error}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Text Input and Results */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Text Input */}
          <Card>
            <CardHeader>
              <CardTitle>📝 Test Text</CardTitle>
              <CardDescription>Enter text to test against your regex pattern</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={testText}
                onChange={(e) => setTestText(e.target.value)}
                placeholder="Enter text to test against the pattern"
                className="min-h-40 font-mono"
              />
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setTestText('')}>
                  Clear Text
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          <Card>
            <CardHeader>
              <CardTitle>📋 Results</CardTitle>
              <CardDescription>
                {matches
                  ? `Found ${matches.length} ${matches.length === 1 ? 'match' : 'matches'}`
                  : 'No matches found'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {testText && (
                <div className="p-3 border rounded-md bg-muted/30">
                  <div className="font-medium mb-2 text-sm">Matches Highlighted:</div>
                  <div
                    className="whitespace-pre-wrap font-mono text-sm"
                    dangerouslySetInnerHTML={{ __html: highlightMatches(testText) }}
                  />
                </div>
              )}

              {matches && matches.length > 0 && (
                <div className="space-y-3">
                  <div className="font-medium text-sm">Match Details:</div>
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {matches.map((match, index) => (
                      <div key={index} className="border rounded-md p-2 bg-secondary/5">
                        <div className="flex justify-between items-center mb-1">
                          <Badge variant="outline">Match {index + 1}</Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2"
                            onClick={() => handleCopy(match.text)}
                          >
                            <Copy size={14} />
                          </Button>
                        </div>
                        <div className="font-mono text-sm break-all">{match.text}</div>
                        {match.groups.length > 0 && (
                          <div className="mt-2 text-xs">
                            <div className="font-medium">Capture Groups:</div>
                            {match.groups.map((group, groupIndex) => (
                              <div key={groupIndex} className="ml-2 mt-1">
                                Group {groupIndex + 1}: <span className="font-mono">{group}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Pattern Explanation */}
        {regexPattern && (
          <Card>
            <CardHeader>
              <CardTitle>🧠 Pattern Explanation</CardTitle>
              <CardDescription>Understanding what your regex pattern does</CardDescription>
            </CardHeader>
            <CardContent>
              <RegexExplainer pattern={regexPattern} />
            </CardContent>
          </Card>
        )}

        {/* Cheat Sheet */}
        <Card>
          <CardHeader>
            <CardTitle>📚 Regex Cheat Sheet</CardTitle>
            <CardDescription>Common regex patterns by language</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="javascript">
              <TabsList className="mb-4">
                <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                <TabsTrigger value="python">Python</TabsTrigger>
                <TabsTrigger value="php">PHP/PCRE</TabsTrigger>
                <TabsTrigger value="golang">Go</TabsTrigger>
                <TabsTrigger value="java">Java</TabsTrigger>
                <TabsTrigger value="csharp">C#</TabsTrigger>
              </TabsList>

              {Object.keys(cheatSheets).map(language => (
                <TabsContent key={language} value={language} className="space-y-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {cheatSheets[language as keyof typeof cheatSheets].map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between border rounded-md p-2 hover:bg-secondary/5"
                      >
                        <div className="flex items-center gap-2">
                          <code className="font-mono text-sm bg-primary/5 px-2 py-1 rounded">{item.pattern}</code>
                          <span className="text-sm">{item.description}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2"
                          onClick={() => handleCopy(item.pattern)}
                        >
                          <Copy size={14} />
                        </Button>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        {/* Clear Button */}
        <div className="flex justify-start">
          <Button
            onClick={handleClear}
            variant="destructive"
            className="w-full md:w-auto"
          >
            <Trash className="h-5 w-5 mr-2" />
            Clear All Inputs
          </Button>
        </div>
      </div>
    </div>
  );
}