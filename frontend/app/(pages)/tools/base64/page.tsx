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

export default function Base64() {
  const [decodedText, setDecodedText] = useState("");
  const [encodedText, setEncodedText] = useState("");

  const router = useRouter();

  const routeTo = (path: string) => {
    router.push(path);
  }

  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  // Debounced encoding
  useEffect(() => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

    debounceTimeout.current = setTimeout(() => {
      try {
        setEncodedText(btoa(decodedText));
      } catch {
        setEncodedText("Error encoding text. Please check your input.");
      }
    }, 500);
  }, [decodedText]);

  // Debounced decoding
  useEffect(() => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

    debounceTimeout.current = setTimeout(() => {
      try {
        setDecodedText(atob(encodedText));
      } catch {
        setDecodedText("Error decoding text. Please check your input.");
      }
    }, 500);
  }, [encodedText]);

  const handleClear = () => {
    setDecodedText("");
    setEncodedText("");
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
              onChange={setDecodedText}
              onCopy={() => handleCopy(decodedText)}
              onPaste={() => handlePaste(setDecodedText)}
            />
          </Card>

          <Card className="flex flex-col flex-1 p-6 gap-6">
            <TextAreaWithActions
              id="encoded-text"
              label="Base64 Text (Encoded)"
              placeholder="Type or paste your Base64 text here..."
              value={encodedText}
              onChange={setEncodedText}
              onCopy={() => handleCopy(encodedText)}
              onPaste={() => handlePaste(setEncodedText)}
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