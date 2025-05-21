"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Trash } from "lucide-react";
import { TopSpacing } from "@/components/top-spacing";
import { TextAreaWithActions } from "@/components/text-area-with-actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import FavoriteButton from "@/components/favorite-button";
import { handleCopy, handlePaste } from '@/utils/clipboard';
import { useClientToolPerformance } from '@/utils/performanceTracker';
import { ClientToolTracker } from '@/components/client-tool-tracker';

export default function Base64() {
  return (
    <ClientToolTracker name="Base64" icon="Binary" trackInitialLoad={false}>
      <Base64Tool />
    </ClientToolTracker>
  );
}

function Base64Tool() {
  const [decodedText, setDecodedText] = useState("");
  const [encodedText, setEncodedText] = useState("");
  const [updateSource, setUpdateSource] = useState<'encoded' | 'decoded' | null>(null);
  const { trackOperation } = useClientToolPerformance('base64');

  const router = useRouter();
  const debounceTimeoutEncoding = useRef<NodeJS.Timeout | null>(null);
  const debounceTimeoutDecoding = useRef<NodeJS.Timeout | null>(null);
  const encodingTracker = useRef<{ complete: () => void } | null>(null);
  const decodingTracker = useRef<{ complete: () => void } | null>(null);

  const routeTo = (path: string) => {
    router.push(path);
  }

  // Track page activity
  useEffect(() => {
    // Force a re-render on initial mount 
    setUpdateSource(null);
  }, []);

  // Update decoded text when user types in the plain text field
  const handleDecodedTextChange = (text: string) => {
    // Start tracking when user starts typing
    if (!encodingTracker.current && text !== decodedText) {
      encodingTracker.current = trackOperation('encode');
    }

    setDecodedText(text);
    setUpdateSource('decoded');
  };

  // Update encoded text when user types in the Base64 field
  const handleEncodedTextChange = (text: string) => {
    // Start tracking when user starts typing
    if (!decodingTracker.current && text !== encodedText) {
      decodingTracker.current = trackOperation('decode');
    }

    setEncodedText(text);
    setUpdateSource('encoded');
  };

  // Encoding (when plain text changes)
  useEffect(() => {
    if (updateSource !== 'decoded') return;

    if (debounceTimeoutEncoding.current) clearTimeout(debounceTimeoutEncoding.current);

    debounceTimeoutEncoding.current = setTimeout(() => {
      if (decodedText === "") {
        setEncodedText("");
        if (encodingTracker.current) {
          encodingTracker.current = null; // Discard tracker if input is empty
        }
        return;
      }

      try {
        const result = btoa(decodedText);
        setEncodedText(result);

        // Complete tracking if started
        if (encodingTracker.current) {
          encodingTracker.current.complete();
          encodingTracker.current = null;
        }
      } catch (error) {
        console.error("Encoding error:", error);
        setEncodedText("Error encoding text. Please check your input.");
        
        // Still clear tracker on error
        if (encodingTracker.current) {
          encodingTracker.current = null;
        }
      }
    }, 500);
  }, [decodedText, trackOperation, updateSource]);

  // Decoding (when Base64 text changes)
  useEffect(() => {
    if (updateSource !== 'encoded') return;

    if (debounceTimeoutDecoding.current) clearTimeout(debounceTimeoutDecoding.current);

    debounceTimeoutDecoding.current = setTimeout(() => {
      if (encodedText === "") {
        setDecodedText("");
        if (decodingTracker.current) {
          decodingTracker.current = null; // Discard tracker if input is empty
        }
        return;
      }
      
      try {
        const result = atob(encodedText);
        setDecodedText(result);

        // Complete tracking if started
        if (decodingTracker.current) {
          decodingTracker.current.complete();
          decodingTracker.current = null;
        }
      } catch (error) {
        console.error("Decoding error:", error);
        setDecodedText("Error decoding text. Please check your input.");
        
        // Still clear tracker on error
        if (decodingTracker.current) {
          decodingTracker.current = null;
        }
      }
    }, 500);
  }, [encodedText, trackOperation, updateSource]);

  const handleClear = () => {
    setDecodedText("");
    setEncodedText("");
    setUpdateSource(null);
    
    // Clear any active trackers
    if (encodingTracker.current) {
      encodingTracker.current = null;
    }
    
    if (decodingTracker.current) {
      decodingTracker.current = null;
    }
  };

  // Create wrapper functions for paste that manage the update source
  const handlePasteDecoded = () => {
    // Start tracking when user pastes
    if (!encodingTracker.current) {
      encodingTracker.current = trackOperation('encode');
    }
    
    handlePaste((text) => {
      setDecodedText(text);
      setUpdateSource('decoded');
    });
  };

  const handlePasteEncoded = () => {
    // Start tracking when user pastes
    if (!decodingTracker.current) {
      decodingTracker.current = trackOperation('decode');
    }
    
    handlePaste((text) => {
      setEncodedText(text);
      setUpdateSource('encoded');
    });
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
              <BreadcrumbPage>Base64</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <TopSpacing />

      {/* Title with Favorite Button */}
      <div className="flex items-center justify-center gap-2 my-3">
        <h1 className="text-3xl font-bold text-center">Base64 Encoder/Decoder</h1>
        <FavoriteButton
          toolUrl="/tools/base64"
          toolName="Base64"
          iconName="Binary"
        />
      </div>

      {/* Description */}
      <div className="text-center max-w-2xl mx-auto">
        <p className="text-muted-foreground">
          Base64 is a binary-to-text encoding scheme that represents binary data in an ASCII string format. It is commonly used for transmitting binary data over text-based channels, such as email or HTTP headers.
        </p>
      </div>

      {/* Content */}
      <div className="mx-8 mt-8 mb-24 flex flex-col gap-5">
        <div className="flex flex-col md:flex-row gap-6">
          <Card className="flex flex-col flex-1 p-6 gap-6">
            <TextAreaWithActions
              id="decoded-text"
              label="Plain Text (Decoded)"
              placeholder="Type or paste your plain text here..."
              value={decodedText}
              onChange={handleDecodedTextChange}
              onCopy={() => handleCopy(decodedText)}
              onPaste={handlePasteDecoded}
            />
          </Card>

          <Card className="flex flex-col flex-1 p-6 gap-6">
            <TextAreaWithActions
              id="encoded-text"
              label="Base64 Text (Encoded)"
              placeholder="Type or paste your Base64 text here..."
              value={encodedText}
              onChange={handleEncodedTextChange}
              onCopy={() => handleCopy(encodedText)}
              onPaste={handlePasteEncoded}
            />
          </Card>
        </div>

        {/* Clear Button */}
        <div className="flex gap-5 justify-start">
          <Button
            onClick={handleClear}
            variant={"destructive"}
            className="w-full"
          >
            <Trash className="h-5 w-5" />
            Clear All
          </Button>
        </div>
      </div>
    </div>
  );
}