"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { apiWithoutCredentials } from "@/utils/axios";
import CryptoJS from "crypto-js";

import { Trash } from "lucide-react";

import { TopSpacing } from "@/components/top-spacing";
import { TextAreaWithActions } from "@/components/text-area-with-actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import { handleCopy, handlePaste } from '@/utils/clipboard';

export default function MD5() {
  const [decodedText, setDecodedText] = useState("");
  const [encodedText, setEncodedText] = useState("");
  const [error, setError] = useState("");

  const router = useRouter();

  const routeTo = (path: string) => {
    router.push(path);
  }

  const handleClear = () => {
    setDecodedText("");
    setEncodedText("");
    setError("");
  };

  const fetchDecryptedText = async (hash: string) => {
    if (!hash) {
      return;
    }

    try {
      const response = await apiWithoutCredentials.get(`/api/tools/decrypt-md5?hash=${hash}`);

      if (response.data.decryptedText) {
        setDecodedText(response.data.decryptedText);
      } else {
        setError("Hash not found in dictionary.");
      }
    } catch (err) {
      setError("An error occurred while trying to decrypt the hash.");
    }
  };

  const addWordToDictionary = async (word: string) => {
    try {
      await apiWithoutCredentials.post("/api/tools/add-to-wordlist", { word });
    } catch (err) {
      console.error("Failed to add word to dictionary.");
    }
  }

  const encryptText = (text: string) => {
    setEncodedText(CryptoJS.MD5(text).toString(CryptoJS.enc.Hex));

    if (!text.includes('\n') && text !== '') {
      addWordToDictionary(text);
    }
  }

  const handleChangeEncodedText = (text: string) => {
    setEncodedText(text);
    setDecodedText("");
  }

  const handleChangeDecodedText = (text: string) => {
    setDecodedText(text);
    setEncodedText("");
  }

  return (
    <div className="h-full w-full">
      <div className="relative size-0">
        <Breadcrumb className="absolute left-20 top-[22px] w-max">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink className="cursor-pointer" onClick={() => routeTo('/dashboard')}>Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink className="cursor-pointer" onClick={() => routeTo('/tools')}>Tools</BreadcrumbLink>
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
      <h1 className="text-3xl font-bold my-3 text-center">MD5 Encoder/Decoder</h1>

      {/* Content */}
      <div className="mx-8 mt-8 mb-24 flex flex-col gap-5">
        <div className="flex flex-col md:flex-row gap-6">
          <Card className="flex flex-col flex-1 p-6 gap-6">
            <TextAreaWithActions
              id="decoded-text"
              label="Plain Text (Decoded)"
              placeholder="Type or paste your plain text here..."
              value={decodedText}
              onChange={handleChangeDecodedText}
              onCopy={() => handleCopy(decodedText)}
              onPaste={() => handlePaste(setDecodedText)}
            />

            <Button
              className="flex-1"
              onClick={() => encryptText(decodedText)}
            >
              Encrypt
            </Button>
          </Card>

          <Card className="flex flex-col flex-1 p-6 gap-6">
            <TextAreaWithActions
              id="encoded-text"
              label="MD5 Hash (Encoded)"
              placeholder="Type or paste your MD5 hash here..."
              value={encodedText}
              onChange={handleChangeEncodedText}
              onCopy={() => handleCopy(encodedText)}
              onPaste={() => handlePaste(setEncodedText)}
            />

            <Button
              className="flex-1"
              onClick={() => fetchDecryptedText(encodedText)}
            >
              Decrypt
            </Button>
          </Card>
        </div>

        {/* Error Message */}
        {error && <p className="text-red-500 text-center mt-4">{error}</p>}

        {/* Clear Button */}
        <div className="flex gap-5 justify-start">
          <Button
            onClick={handleClear}
            className="w-full bg-white text-red-600 dark:text-red-600 border border-red-600 dark:border-none hover:bg-red-300/5"
          >
            <Trash className="h-5 w-5" />
            Clear All
          </Button>
        </div>
      </div>
    </div >
  );
}