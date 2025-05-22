"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, Copy, Trash } from "lucide-react";

import { TopSpacing } from "@/components/top-spacing";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import FavoriteButton from "@/components/favorite-button";
import { handleCopy } from '@/utils/clipboard';
import { useClientToolPerformance } from '@/utils/performanceTracker';
import { ClientToolTracker } from '@/components/client-tool-tracker';
import { debounce } from '@/utils/debounce';
import { toast } from "sonner";

export default function TokenGeneratorPage() {
  return (
    <ClientToolTracker name="Token Generator" icon="Code" trackInitialLoad={false}>
      <TokenGenerator />
    </ClientToolTracker>
  );
}

function TokenGenerator() {
  const [token, setToken] = useState("");
  const [length, setLength] = useState(16);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  const { trackOperation } = useClientToolPerformance('token-generator');
  const generateTracker = useRef<{ complete: () => void } | null>(null);

  const router = useRouter();

  // Track user modifications to trigger generation
  const [pendingChanges, setPendingChanges] = useState(false);

  const routeTo = (path: string) => {
    router.push(path);
  }

  // Flag to control initial load
  useEffect(() => {
    setIsInitialLoad(false);
  }, []);

  // Generate a random token based on the selected options
  const generateToken = () => {
    // Start performance tracking for explicit generation (manual refresh)
    // We only track when explicitly generating, not on initial load or option changes
    if (!isInitialLoad) {
      const charsetDescription = [
        includeLowercase ? 'lower' : '',
        includeUppercase ? 'upper' : '',
        includeNumbers ? 'num' : '',
        includeSymbols ? 'sym' : ''
      ].filter(Boolean).join('-');
      
      generateTracker.current = trackOperation(`generate-${length}-${charsetDescription}`);
    }
    
    try {
      let characters = "";

      if (includeLowercase) characters += "abcdefghijklmnopqrstuvwxyz";
      if (includeUppercase) characters += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      if (includeNumbers) characters += "0123456789";
      if (includeSymbols) characters += "!@#$%^&*()_+{}|:<>?-=[];,./";

      // Default to lowercase if nothing is selected
      if (characters === "") characters = "abcdefghijklmnopqrstuvwxyz";

      let result = "";
      const charactersLength = characters.length;

      for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
      }

      setToken(result);
      setPendingChanges(false);
      
      // Complete tracking if we started it
      if (generateTracker.current) {
        generateTracker.current.complete();
        generateTracker.current = null;
      }
    } catch {
      toast.error("Token generation error.");
      
      // Clear tracker on error
      if (generateTracker.current) {
        generateTracker.current = null;
      }
    }
  };

  // Generate token on explicit user request
  const handleGenerateToken = () => {
    generateToken();
  };

  // Debounced version of generateToken for option changes
  const debouncedGenerateToken = useMemo(
    () => debounce(generateToken, 500),
    [length, includeUppercase, includeLowercase, includeNumbers, includeSymbols]
  );

  // Flag that changes were made and schedule debounced token generation
  useEffect(() => {
    if (isInitialLoad) return;
    
    setPendingChanges(true);
    debouncedGenerateToken();
  }, [length, includeUppercase, includeLowercase, includeNumbers, includeSymbols, debouncedGenerateToken, isInitialLoad]);

  // Initial token generation
  useEffect(() => {
    generateToken();
  }, []);

  const handleClear = () => {
    setToken("");
  };

  // Handle length change without triggering immediate updates
  const handleLengthChange = (value: number) => {
    setLength(value);
  };

  return (
    <div className="h-full w-full">
      {/* Breadcrumb */}
      <div className="relative size-0">
        <Breadcrumb className="absolute left-20 top-[22px] w-max">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink className="cursor-pointer" onClick={() => routeTo('/tools')}>Tools</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Token Generator</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <TopSpacing />

      {/* Title with Favorite Button */}
      <div className="flex items-center justify-center gap-2 my-3">
        <h1 className="text-3xl font-bold text-center">Token Generator</h1>
        <FavoriteButton
          toolUrl="/tools/token-generator"
          toolName="Token Generator"
          iconName="Code"
        />
      </div>

      {/* Description */}
      <div className="text-center max-w-2xl mx-auto">
        <p className="text-muted-foreground">
          A token is a string of characters that is used to identify a user or a device. It is often used in authentication and authorization processes.
        </p>
      </div>

      <div className="mx-8 mt-8 mb-24 flex flex-col gap-5">
        {/* Token Result Card */}
        <Card className="flex flex-col p-6 gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="token" className="text-lg font-semibold">Generated Token</Label>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={() => handleCopy(token)}
                  disabled={!token}
                  className="h-8 w-8"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={handleGenerateToken}
                  className="h-8 w-8"
                >
                  <RefreshCw className={`h-4 w-4 ${pendingChanges ? "animate-spin" : ""}`} />
                </Button>
              </div>
            </div>
            <Input
              id="token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Your generated token will appear here"
              className={`font-mono ${pendingChanges ? "opacity-50" : ""}`}
            />
          </div>
        </Card>

        {/* Options Card */}
        <Card className="flex flex-col p-6 gap-6">
          <h2 className="text-xl font-semibold">Token Options</h2>

          {/* Length Option */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="token-length">Length: {length}</Label>
              <Input
                id="token-length"
                type="number"
                min={4}
                max={128}
                value={length}
                onChange={(e) => handleLengthChange(parseInt(e.target.value) || 16)}
                className="w-20"
              />
            </div>
            <input
              type="range"
              min={4}
              max={128}
              value={length}
              onChange={(e) => handleLengthChange(parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Character Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="uppercase" className="cursor-pointer">Uppercase Letters (A-Z)</Label>
              <Switch
                id="uppercase"
                checked={includeUppercase}
                onCheckedChange={setIncludeUppercase}
              />
            </div>

            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="lowercase" className="cursor-pointer">Lowercase Letters (a-z)</Label>
              <Switch
                id="lowercase"
                checked={includeLowercase}
                onCheckedChange={setIncludeLowercase}
              />
            </div>

            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="numbers" className="cursor-pointer">Numbers (0-9)</Label>
              <Switch
                id="numbers"
                checked={includeNumbers}
                onCheckedChange={setIncludeNumbers}
              />
            </div>

            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="symbols" className="cursor-pointer">Symbols (!@#$%^&*)</Label>
              <Switch
                id="symbols"
                checked={includeSymbols}
                onCheckedChange={setIncludeSymbols}
              />
            </div>
          </div>
        </Card>

        {/* Clear Button */}
        <div className="flex gap-5 justify-start">
          <Button
            onClick={handleClear}
            variant="destructive"
          >
            <Trash className="h-5 w-5 mr-2" />
            Clear Token
          </Button>
        </div>
      </div>
    </div>
  );
} 