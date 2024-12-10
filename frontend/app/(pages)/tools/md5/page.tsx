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

  const handleClear = () => {
    setDecodedText("");
    setEncodedText("");
    setError("");
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handlePaste = (setter: React.Dispatch<React.SetStateAction<string>>) => {
    navigator.clipboard.readText().then(
      (text) => setter(text)
    );
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
            onChange={handleChangeDecodedText}
            onCopy={() => handleCopy(decodedText)}
            onPaste={() => handlePaste(setDecodedText)}
          />

          <TextAreaWithActions
            id="encoded-text"
            label="MD5 Hash (Encoded)"
            placeholder="Type or paste your MD5 hash here..."
            value={encodedText}
            onChange={handleChangeEncodedText}
            onCopy={() => handleCopy(encodedText)}
            onPaste={() => handlePaste(setEncodedText)}
          />
        </div>

        <div className="flex gap-5 justify-start">
          <div
            className="flex flex-1 justify-center items-center bg-blue-accent text-gray-200 px-6 py-2 font-medium rounded-lg shadow cursor-pointer hover:bg-blue-accent-hover"
            onClick={() => encryptText(decodedText)}
          >
            Encrypt
          </div>
          <div
            className="flex flex-1 justify-center items-center bg-blue-accent text-gray-200 px-6 py-2 font-medium rounded-lg shadow cursor-pointer hover:bg-blue-accent-hover"
            onClick={() => fetchDecryptedText(encodedText)}
          >
            Decrypt
          </div>
        </div>

        <br />

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