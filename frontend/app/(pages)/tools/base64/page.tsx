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

      {/* Title */}
      <h1 className="text-3xl font-bold my-3 text-center">Base64 Encoder/Decoder</h1>

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