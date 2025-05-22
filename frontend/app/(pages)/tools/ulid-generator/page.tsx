"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, Copy, Trash } from "lucide-react";
import { ulid } from 'ulid';

import { TopSpacing } from "@/components/top-spacing";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  RadioGroup,
  RadioGroupItem
} from "@/components/ui/radio-group";
import FavoriteButton from "@/components/favorite-button";
import { handleCopy } from '@/utils/clipboard';
import { useClientToolPerformance } from '@/utils/performanceTracker';
import { ClientToolTracker } from '@/components/client-tool-tracker';
import { debounce } from '@/utils/debounce';
import { toast } from "sonner";

export default function UlidGeneratorPage() {
  return (
    <ClientToolTracker name="ULID Generator" icon="Barcode" trackInitialLoad={false}>
      <UlidGenerator />
    </ClientToolTracker>
  );
}

function UlidGenerator() {
  const [ulids, setUlids] = useState<string[]>([ulid()]);
  const [quantity, setQuantity] = useState(1);
  const [format, setFormat] = useState("raw");
  const [isPending, setIsPending] = useState(false);

  const { trackOperation } = useClientToolPerformance('ulid-generator');
  const generateTracker = useRef<{ complete: () => void } | null>(null);
  const debouncedUpdateRef = useRef<(newQuantity: number) => void>();

  const router = useRouter();

  const routeTo = (path: string) => {
    router.push(path);
  };

  const generateUlids = () => {
    // Start tracking performance
    generateTracker.current = trackOperation(`generate-${quantity}`);

    try {
      const newUlids: string[] = [];

      for (let i = 0; i < quantity; i++) {
        newUlids.push(ulid());
      }

      setUlids(newUlids);

      // Complete tracking
      if (generateTracker.current) {
        generateTracker.current.complete();
        generateTracker.current = null;
      }
    } catch {
      // Handle errors and clean up tracker
      if (generateTracker.current) {
        generateTracker.current = null;
      }
      toast.error("Error generating ULIDs.");
    }
  };

  const handleFormatChange = (value: string) => {
    setFormat(value);
  };

  // Create a debounced version of the quantity update function
  React.useEffect(() => {
    const updateQuantity = (newQuantity: number) => {
      // Start tracking for quantity change
      generateTracker.current = trackOperation(`quantity-change-${newQuantity}`);
      setIsPending(false);

      try {
        if (newQuantity > ulids.length) {
          // Generate more ULIDs
          const newUlids = [...ulids];
          for (let i = ulids.length; i < newQuantity; i++) {
            newUlids.push(ulid());
          }
          setUlids(newUlids);
        } else if (newQuantity < ulids.length) {
          // Reduce number of ULIDs
          setUlids(ulids.slice(0, newQuantity));
        }

        // Complete tracking
        if (generateTracker.current) {
          generateTracker.current.complete();
          generateTracker.current = null;
        }
      } catch {
        // Handle errors and clean up tracker
        if (generateTracker.current) {
          generateTracker.current = null;
        }
        toast.error("Error updating ULID quantity.");
      }
    };

    debouncedUpdateRef.current = debounce(updateQuantity, 500);
  }, [ulids, trackOperation]);

  const handleQuantityChange = (value: number) => {
    const newQuantity = Math.max(1, Math.min(100, value));
    setQuantity(newQuantity);
    setIsPending(true);

    if (debouncedUpdateRef.current) {
      debouncedUpdateRef.current(newQuantity);
    }
  };

  const getFormattedValue = (id: string) => {
    if (format === "raw") {
      return id;
    } else {
      // JSON format
      return JSON.stringify({ id });
    }
  };

  const getAllFormattedValues = () => {
    if (format === "raw") {
      return ulids.join('\n');
    } else {
      // JSON format
      if (ulids.length === 1) {
        return JSON.stringify({ id: ulids[0] }, null, 2);
      } else {
        return JSON.stringify(
          ulids.map(id => ({ id })),
          null,
          2
        );
      }
    }
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
              <BreadcrumbPage>ULID Generator</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <TopSpacing />

      {/* Title with Favorite Button */}
      <div className="flex items-center justify-center gap-2 my-3">
        <h1 className="text-3xl font-bold text-center">ULID Generator</h1>
        <FavoriteButton
          toolUrl="/tools/ulid-generator"
          toolName="ULID Generator"
          iconName="Barcode"
        />
      </div>

      {/* Description */}
      <div className="text-center max-w-2xl mx-auto">
        <p className="text-muted-foreground">
          Generate random Universally Unique Lexicographically Sortable Identifier (ULID).
          ULIDs are 128-bit identifiers that are sortable, URL-safe, and contain a timestamp component.
        </p>
      </div>

      <div className="mx-8 mt-8 mb-24 flex flex-col gap-5">
        {/* Options Card */}
        <Card className="flex flex-col p-6 gap-6">
          <h2 className="text-xl font-semibold">ULID Options</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Format Selection */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="ulid-format">Format</Label>
              <RadioGroup value={format} onValueChange={handleFormatChange} className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="raw" id="raw" />
                  <Label htmlFor="raw" className="cursor-pointer">Raw</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="json" id="json" />
                  <Label htmlFor="json" className="cursor-pointer">JSON</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Quantity Selection */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between">
                <Label htmlFor="ulid-quantity">Quantity</Label>
                <span className="text-xs text-muted-foreground px-1">Max: 100</span>
              </div>
              <Input
                id="ulid-quantity"
                type="number"
                min={1}
                max={100}
                value={quantity}
                onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                className={isPending ? "opacity-70" : ""}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <Button
              variant="destructive"
              onClick={() => {
                setUlids([ulid()]);
                setQuantity(1);
              }}
            >
              <Trash className="h-4 w-4 mr-2" />
              Clear
            </Button>
            <Button onClick={generateUlids}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isPending ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </Card>

        {/* Generated ULIDs */}
        <Card className="flex flex-col p-6 gap-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Generated ULIDs</h2>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleCopy(getAllFormattedValues())}
              className="gap-2"
            >
              <Copy className="h-4 w-4" />
              Copy All
            </Button>
          </div>

          <div className="flex flex-col gap-2">
            {ulids.map((id, index) => (
              <div key={index} className="flex gap-2 items-center">
                <Input
                  value={getFormattedValue(id)}
                  readOnly
                  className="font-mono"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleCopy(getFormattedValue(id))}
                  className="h-10 w-10 flex-shrink-0"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
} 