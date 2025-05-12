"use client";

import React, { useState, useEffect } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";

import { handleCopy, handlePaste } from '@/utils/clipboard';

export default function Hash() {
  const [decodedText, setDecodedText] = useState("");
  const [encodedText, setEncodedText] = useState("");
  const [error, setError] = useState("");
  const [algorithm, setAlgorithm] = useState("md5");

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
    if (!checkIfHash(hash, algorithm)) {
      setError("Invalid hash format.");
      return;
    }

    try {
      const response = await apiWithoutCredentials.get(`/api/tools/decrypt-${algorithm}?hash=${hash}`);

      if (response.data.decryptedText) {
        setDecodedText(response.data.decryptedText);
      } else {
        setError("Hash not found in dictionary.");
      }
    } catch {
      setError("An error occurred while trying to decrypt the hash.");
    }
  };

  const addWordToDictionary = async (word: string) => {
    try {
      await apiWithoutCredentials.post("/api/tools/add-to-wordlist", { word });
    } catch {
      console.error("Failed to add word to dictionary.");
    }
  }

  const encryptText = (text: string) => {
    if (algorithm === 'sha1') {
      setEncodedText(CryptoJS.SHA1(text).toString(CryptoJS.enc.Hex));
    } else if (algorithm === 'md5') {
      setEncodedText(CryptoJS.MD5(text).toString(CryptoJS.enc.Hex));
    }

    if (!text.includes('\n') && text !== '') {
      addWordToDictionary(text);
    }
  }

  const handleChangeEncodedText = (text: string) => {
    setEncodedText(text);
    setDecodedText("");
    setError("");
  }

  const handleChangeDecodedText = (text: string) => {
    setDecodedText(text);
    setEncodedText("");
  }

  const checkIfHash = (value: string, algorithm: string): boolean => {
    const hashPatterns: Record<string, RegExp> = {
      md5: /^[a-f0-9]{32}$/,
      sha1: /^[a-f0-9]{40}$/,
      sha256: /^[a-f0-9]{64}$/,
      sha512: /^[a-f0-9]{128}$/
    };

    const pattern = hashPatterns[algorithm.toLowerCase()];
    if (!pattern) {
      throw new Error(`Unsupported algorithm: ${algorithm}`);
    }

    return pattern.test(value);
  };

  useEffect(() => {
    setError("");
  }, [algorithm]);

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
              <BreadcrumbPage>Hash</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <TopSpacing />

      {/* Title */}
      <h1 className="text-3xl font-bold my-3 text-center">Hash Encrypt/Decrypt</h1>

      {/* Content */}
      <div className="mx-8 mt-8 mb-24 flex flex-col gap-5">

        <div className="flex flex-col gap-4">
          <Select onValueChange={(value) => setAlgorithm(value)} value={algorithm}>
            <SelectTrigger className="w-1/4">
              <span>{algorithm.toUpperCase()}</span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="md5">MD5</SelectItem>
              <SelectItem value="sha1">SHA1</SelectItem>
            </SelectContent>
          </Select>
        </div>

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
              label={`${algorithm.toUpperCase()} Hash (Encoded)`}
              placeholder={`Type or paste your ${algorithm.toUpperCase()} hash here...`}
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