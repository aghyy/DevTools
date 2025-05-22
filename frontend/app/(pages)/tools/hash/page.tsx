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
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";

import { handleCopy, handlePaste } from '@/utils/clipboard';
import FavoriteButton from "@/components/favorite-button";
import { useClientToolPerformance } from '@/utils/performanceTracker';
import { ClientToolTracker } from '@/components/client-tool-tracker';
import { toast } from "sonner";

export default function HashPage() {
  return (
    <ClientToolTracker name="Hash" icon="Hash" trackInitialLoad={false}>
      <HashTool />
    </ClientToolTracker>
  );
}

function HashTool() {
  const [decodedText, setDecodedText] = useState("");
  const [encodedText, setEncodedText] = useState("");
  const [algorithm, setAlgorithm] = useState("md5");
  const [encoding, setEncoding] = useState("hex");
  
  const { trackOperation } = useClientToolPerformance('hash');
  const encryptTracker = useRef<{ complete: () => void } | null>(null);
  const decryptTracker = useRef<{ complete: () => void } | null>(null);

  const router = useRouter();

  const routeTo = (path: string) => {
    router.push(path);
  }

  const handleClear = () => {
    setDecodedText("");
    setEncodedText("");
    
    // Clear any active trackers
    if (encryptTracker.current) {
      encryptTracker.current = null;
    }
    if (decryptTracker.current) {
      decryptTracker.current = null;
    }
  };

  const fetchDecryptedText = async (hash: string) => {
    if (!checkIfHash(hash, algorithm)) {
      toast.error("Invalid hash format.");
      return;
    }

    // Start tracking for client-side decrypt attempt
    decryptTracker.current = trackOperation(`decrypt-attempt-${algorithm}`);
    
    try {
      let response;

      // Use the generic endpoint for non-hex encodings or newer algorithms
      if (!['md5', 'sha1'].includes(algorithm)) {
        response = await apiWithoutCredentials.get(`/api/tools/decrypt-hash?hash=${hash}&algorithm=${algorithm}&encoding=${encoding}`);
      } else {
        // Use the dedicated endpoints for backward compatibility but pass encoding
        response = await apiWithoutCredentials.get(`/api/tools/decrypt-${algorithm}?hash=${hash}&encoding=${encoding}`);
      }

      if (response.data.decryptedText) {
        setDecodedText(response.data.decryptedText);
      } else {
        toast.error("Hash not found in dictionary.");
      }
      
      // Complete tracking
      if (decryptTracker.current) {
        decryptTracker.current.complete();
        decryptTracker.current = null;
      }
    } catch {
      toast.error("An error occurred while trying to decrypt the hash.");
      
      // Clear tracker on error
      if (decryptTracker.current) {
        decryptTracker.current = null;
      }
    }
  };

  const addWordToDictionary = async (word: string) => {
    try {
      await apiWithoutCredentials.post("/api/tools/add-to-wordlist", { word });
    } catch {
      toast.error("Failed to add word to dictionary.");
    }
  }

  const encryptText = (text: string) => {
    if (!text) {
      toast.error("Please enter text to encrypt.");
      return;
    }

    // Start tracking for client-side encryption
    encryptTracker.current = trackOperation(`encrypt-${algorithm}-${encoding}`);
    
    try {
      let hash;

      // Get hash based on selected algorithm
      switch (algorithm) {
        case 'md5':
          hash = CryptoJS.MD5(text);
          break;
        case 'sha1':
          hash = CryptoJS.SHA1(text);
          break;
        case 'sha256':
          hash = CryptoJS.SHA256(text);
          break;
        case 'sha224':
          hash = CryptoJS.SHA224(text);
          break;
        case 'sha512':
          hash = CryptoJS.SHA512(text);
          break;
        case 'sha384':
          hash = CryptoJS.SHA384(text);
          break;
        case 'sha3':
          hash = CryptoJS.SHA3(text);
          break;
        case 'ripemd160':
          hash = CryptoJS.RIPEMD160(text);
          break;
        default:
          hash = CryptoJS.MD5(text);
          break;
      }

      // Format the hash according to the selected encoding
      switch (encoding) {
        case 'binary':
          // Convert hex to binary manually since CryptoJS doesn't have Base2 encoder
          const hexString = hash.toString(CryptoJS.enc.Hex);
          const binaryString = hexString.split('')
            .map(hex => parseInt(hex, 16).toString(2).padStart(4, '0'))
            .join('');
          setEncodedText(binaryString);
          break;
        case 'hex':
          setEncodedText(hash.toString(CryptoJS.enc.Hex));
          break;
        case 'base64':
          setEncodedText(hash.toString(CryptoJS.enc.Base64));
          break;
        case 'base64url':
          setEncodedText(hash.toString(CryptoJS.enc.Base64url));
          break;
        default:
          setEncodedText(hash.toString(CryptoJS.enc.Hex));
          break;
      }

      if (!text.includes('\n') && text !== '') {
        addWordToDictionary(text);
      }
      
      // Complete tracking on success
      if (encryptTracker.current) {
        encryptTracker.current.complete();
        encryptTracker.current = null;
      }
    } catch {
      toast.error("Encryption error.");
      
      // Clear tracker on error
      if (encryptTracker.current) {
        encryptTracker.current = null;
      }
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

  const checkIfHash = (value: string, algorithm: string): boolean => {
    // For non-hex encodings, we need a different way to validate
    if (encoding !== 'hex') {
      return true; // Simple accept for non-hex encodings since they're harder to validate by pattern
    }

    const hashPatterns: Record<string, RegExp> = {
      md5: /^[a-f0-9]{32}$/,
      sha1: /^[a-f0-9]{40}$/,
      sha256: /^[a-f0-9]{64}$/,
      sha224: /^[a-f0-9]{56}$/,
      sha512: /^[a-f0-9]{128}$/,
      sha384: /^[a-f0-9]{96}$/,
      sha3: /^[a-f0-9]{128}$/,
      ripemd160: /^[a-f0-9]{40}$/
    };

    const pattern = hashPatterns[algorithm.toLowerCase()];
    if (!pattern) {
      toast.error(`Unsupported algorithm: ${algorithm}`);
      return false;
    }

    return pattern.test(value);
  };

  useEffect(() => {
    setEncodedText("");
    setDecodedText("");
  }, [algorithm, encoding]);

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
      <div className="flex items-center justify-center gap-2 my-3">
        <h1 className="text-3xl font-bold my-3 text-center">Hash Encrypt/Decrypt</h1>
        <FavoriteButton
          toolUrl="/tools/hash"
          toolName="Hash"
          iconName="Hash"
        />
      </div>
      
      {/* Description */}
      <div className="text-center max-w-2xl mx-auto">
        <p className="text-muted-foreground">
          Hash functions are cryptographic algorithms that transform data into a fixed-length value, known as a hash. They are widely used in various applications, including password storage, data integrity verification, and digital signatures.
        </p>
      </div>

      {/* Content */}
      <div className="mx-8 mt-8 mb-24 flex flex-col gap-5">
        <div className="flex items-center justify-between gap-4">
          <div className="w-1/2">
            <Select onValueChange={(value) => setAlgorithm(value)} value={algorithm}>
              <SelectTrigger>
                <span>Algorithm: {algorithm.toUpperCase()}</span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="md5">MD5</SelectItem>
                <SelectItem value="sha1">SHA1</SelectItem>
                <SelectItem value="sha256">SHA256</SelectItem>
                <SelectItem value="sha224">SHA224</SelectItem>
                <SelectItem value="sha512">SHA512</SelectItem>
                <SelectItem value="sha384">SHA384</SelectItem>
                <SelectItem value="sha3">SHA3</SelectItem>
                <SelectItem value="ripemd160">RIPEMD160</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-1/2">
            <Select onValueChange={(value) => setEncoding(value)} value={encoding}>
              <SelectTrigger>
                <span>Encoding: {encoding.charAt(0).toUpperCase() + encoding.slice(1)}</span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="binary">Binary (base 2)</SelectItem>
                <SelectItem value="hex">Hexadecimal (base 16)</SelectItem>
                <SelectItem value="base64">Base64</SelectItem>
                <SelectItem value="base64url">Base64url</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
              label={`${algorithm.toUpperCase()} Hash (${encoding.toUpperCase()})`}
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