"use client";

import React, { useState, useEffect, useRef } from "react";
import { TopSpacing } from "@/components/top-spacing";
import { TextAreaWithActions } from "@/components/text-area-with-actions";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Trash } from "lucide-react";

export default function Base64() {
  const [decodedText, setDecodedText] = useState("");
  const [encodedText, setEncodedText] = useState("");

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

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(
      () => alert("Copied to clipboard!"),
      () => alert("Failed to copy. Please try again.")
    );
  };

  const handlePaste = (setter: React.Dispatch<React.SetStateAction<string>>) => {
    navigator.clipboard.readText().then(
      (text) => setter(text),
      () => alert("Failed to paste. Please try again.")
    );
  };

  return (
    <div className="h-full w-full">
      {/* Breadcrumb */}
      <div className="relative size-0">
        <Breadcrumb className="absolute left-20 top-[22px] w-max">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/tools">Tools</BreadcrumbLink>
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
      <h1 className="text-3xl font-bold mt-5 text-center">Base64 Encoder/Decoder</h1>

      {/* Content */}
      <div className="mx-12 mt-12 mb-24 flex flex-col gap-5">
        <div className="flex flex-col md:flex-row gap-6">
          <TextAreaWithActions
            id="decoded-text"
            label="Plain Text (Decoded)"
            placeholder="Type or paste your plain text here..."
            value={decodedText}
            onChange={setDecodedText}
            onCopy={() => handleCopy(decodedText)}
            onPaste={() => handlePaste(setDecodedText)}
          />

          <TextAreaWithActions
            id="encoded-text"
            label="Base64 Text (Encoded)"
            placeholder="Type or paste your Base64 text here..."
            value={encodedText}
            onChange={setEncodedText}
            onCopy={() => handleCopy(encodedText)}
            onPaste={() => handlePaste(setEncodedText)}
          />
        </div>

        {/* Clear Button */}
        <div className="flex gap-5 justify-start">
          <div
            onClick={handleClear}
            className="w-full flex items-center justify-center gap-2 px-6 py-2 bg-red-600 text-gray-200 font-medium rounded-lg shadow hover:bg-red-700 cursor-pointer"
          >
            <Trash className="h-5 w-5" />
            Clear All
          </div>
        </div>
      </div>
    </div>
  );
}