"use client";

import React, { useState, useRef } from "react";
import { TopSpacing } from "@/components/top-spacing";
import { TextAreaWithActions } from "@/components/text-area-with-actions";
import { Trash } from "lucide-react";
import { useEffect } from "react";
import { apiWithoutCredentials } from "@/utils/axios";
import CryptoJS from "crypto-js";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function MD5() {
  const [decodedText, setDecodedText] = useState("");
  const [encodedText, setEncodedText] = useState("");
  const [error, setError] = useState("");

  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleClear = () => {
    setDecodedText("");
    setEncodedText("");
    setError("");
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

  const fetchDecryptedText = async (hash: string) => {
    if (!hash) {
      console.log("Hash is empty. Skipping decryption.");
      return;
    }

    try {
      const response = await apiWithoutCredentials.get(`/api/tools/decrypt-md5?hash=${hash}`);
      console.log('Decrypted Text:', response.data.decryptedText);
      if (response.data.decryptedText) {
        setDecodedText(response.data.decryptedText);
      } else {
        setError("Failed to decrypt hash: hash not found in dictionary.");
      }
    } catch (err) {
      setError("An error occurred while trying to decrypt the hash.");
    }
  };

  // Debounced MD5 encryption
  useEffect(() => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

    debounceTimeout.current = setTimeout(() => {
      if (!decodedText) {
        setEncodedText("");
        return;
      }
      setEncodedText(CryptoJS.MD5(decodedText).toString(CryptoJS.enc.Hex));
    }, 500);
  }, [decodedText]);

  // useEffect(() => {
  //   if (encodedText) {
  //     fetchDecryptedText(encodedText);
  //   } else {
  //     setDecodedText("");
  //   }
  // }, [encodedText]);

  return (
    <div className="h-full w-full">
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
              <BreadcrumbPage>MD5</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <TopSpacing />

      {/* Title */}
      <h1 className="text-3xl font-bold mt-5 text-center">MD5 Encoder/Decoder</h1>

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
            label="MD5 Hash (Encoded)"
            placeholder="Type or paste your MD5 hash here..."
            value={encodedText}
            onChange={setEncodedText}
            onCopy={() => handleCopy(encodedText)}
            onPaste={() => handlePaste(setEncodedText)}
          />
        </div>

        {/* Error Message */}
        {error && <p className="text-red-500 text-center mt-4">{error}</p>}

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