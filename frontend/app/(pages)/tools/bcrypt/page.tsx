"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IconCheck, IconCopy, IconHash, IconX } from "@tabler/icons-react";
import { Slider } from "@/components/ui/slider";
import bcrypt from "bcryptjs";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { TopSpacing } from "@/components/top-spacing";
import FavoriteButton from "@/components/favorite-button";
import { useClientToolPerformance } from '@/utils/performanceTracker';
import { ClientToolTracker } from '@/components/client-tool-tracker';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function BcryptPage() {
  return (
    <ClientToolTracker name="Bcrypt" icon="KeyRound" trackInitialLoad={false}>
      <BcryptTool />
    </ClientToolTracker>
  );
}

function BcryptTool() {
  const router = useRouter();
  // Hash tab state
  const [inputText, setInputText] = useState("");
  const [saltRounds, setSaltRounds] = useState(10);
  const [hashResult, setHashResult] = useState("");

  // Compare tab state
  const [compareText, setCompareText] = useState("");
  const [compareHash, setCompareHash] = useState("");
  const [matchResult, setMatchResult] = useState<boolean | null>(null);
  
  // Performance tracking
  const { trackOperation } = useClientToolPerformance('bcrypt');
  const hashTracker = useRef<{ complete: () => void } | null>(null);
  const compareTracker = useRef<{ complete: () => void } | null>(null);

  // Navigation function
  const routeTo = (path: string) => {
    router.push(path);
  };

  // Generate hash function
  const generateHash = () => {
    if (!inputText) {
      toast.error("Please enter text to hash");
      return;
    }

    // Start tracking hash operation
    hashTracker.current = trackOperation(`hash-rounds-${saltRounds}`);
    
    try {
      const salt = bcrypt.genSaltSync(saltRounds);
      const hash = bcrypt.hashSync(inputText, salt);
      setHashResult(hash);
      toast.success("Hash generated successfully");
      
      // Complete tracking
      if (hashTracker.current) {
        hashTracker.current.complete();
        hashTracker.current = null;
      }
    } catch (error) {
      console.error("Hashing error:", error);
      toast.error("Error generating hash");
      
      // Clear tracker on error
      if (hashTracker.current) {
        hashTracker.current = null;
      }
    }
  };

  // Compare hash function
  const compareStrings = () => {
    if (!compareText || !compareHash) {
      toast.error("Please provide both text and hash for comparison");
      return;
    }
    
    // Start tracking compare operation
    compareTracker.current = trackOperation('compare');

    try {
      const result = bcrypt.compareSync(compareText, compareHash);
      setMatchResult(result);
      toast.success("Comparison completed");
      
      // Complete tracking
      if (compareTracker.current) {
        compareTracker.current.complete();
        compareTracker.current = null;
      }
    } catch (error) {
      console.error("Comparison error:", error);
      toast.error("Invalid hash format");
      setMatchResult(false);
      
      // Clear tracker on error
      if (compareTracker.current) {
        compareTracker.current = null;
      }
    }
  };

  // Copy to clipboard
  const copyToClipboard = () => {
    if (!hashResult) return;

    navigator.clipboard.writeText(hashResult)
      .then(() => toast.success("Hash copied to clipboard"))
      .catch(() => toast.error("Failed to copy hash"));
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
              <BreadcrumbPage>Bcrypt</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <TopSpacing />

      {/* Title with Favorite Button */}
      <div className="flex items-center justify-center gap-2 my-3">
        <h1 className="text-3xl font-bold text-center">Bcrypt Tool</h1>
        <FavoriteButton
          toolUrl="/tools/bcrypt"
          toolName="Bcrypt"
          iconName="KeyRound"
        />
      </div>

      {/* Description */}
      <div className="text-center max-w-2xl mx-auto">
        <p className="text-muted-foreground">
          Bcrypt is a password-hashing function based on the Blowfish cipher.
        </p>
      </div>

      {/* Main content */}
      <div className="container mx-auto py-6">
        <Tabs defaultValue="hash" className="max-w-3xl mx-auto">
          <TabsList className="grid grid-cols-2 mb-8">
            <TabsTrigger value="hash">Hash</TabsTrigger>
            <TabsTrigger value="compare">Compare</TabsTrigger>
          </TabsList>

          <TabsContent value="hash">
            <Card>
              <CardHeader>
                <CardTitle>Generate Bcrypt Hash</CardTitle>
                <CardDescription>
                  Enter your text and select salt rounds to generate a secure hash
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="input-text">Your string</Label>
                  <Input
                    id="input-text"
                    placeholder="Enter text to hash"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="salt-rounds">Salt rounds: {saltRounds}</Label>
                    <span className="text-xs text-muted-foreground">
                      (Higher = more secure, but slower)
                    </span>
                  </div>
                  <Slider
                    id="salt-rounds"
                    min={4}
                    max={15}
                    step={1}
                    value={[saltRounds]}
                    onValueChange={(values: number[]) => setSaltRounds(values[0])}
                    className="py-4"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hash-result">Hash result</Label>
                  <div className="relative">
                    <Input
                      id="hash-result"
                      value={hashResult}
                      readOnly
                      className="pr-10"
                      placeholder="Hash will appear here"
                    />
                    {hashResult && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1 h-8 w-8"
                        onClick={copyToClipboard}
                        title="Copy to clipboard"
                      >
                        <IconCopy className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={generateHash} className="w-full">
                  <IconHash className="mr-2 h-4 w-4" />
                  Generate Hash
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="compare">
            <Card>
              <CardHeader>
                <CardTitle>Compare String with Hash</CardTitle>
                <CardDescription>
                  Check if a string matches with a bcrypt hash
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="compare-text">Your string</Label>
                  <Input
                    id="compare-text"
                    placeholder="Enter text to compare"
                    value={compareText}
                    onChange={(e) => setCompareText(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="compare-hash">Your hash</Label>
                  <Input
                    id="compare-hash"
                    placeholder="Enter bcrypt hash"
                    value={compareHash}
                    onChange={(e) => setCompareHash(e.target.value)}
                  />
                </div>

                {matchResult !== null && (
                  <div className={`p-4 rounded-md ${matchResult ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'}`}>
                    <p className="font-medium flex items-center">
                      {matchResult ? (
                        <>
                          <IconCheck className="mr-2 h-5 w-5 text-green-600 dark:text-green-400" />
                          <span>Match! The string correctly matches the hash.</span>
                        </>
                      ) : (
                        <>
                          <IconX className="mr-2 h-5 w-5 text-red-600 dark:text-red-400" />
                          <span>No match. The string does not match the hash.</span>
                        </>
                      )}
                    </p>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button onClick={compareStrings} className="w-full">
                  Compare
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 