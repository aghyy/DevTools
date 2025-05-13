'use client';

import { useState } from 'react';
import { useRouter } from "next/navigation";
import {
  Trash,
  CircleAlertIcon,
  RefreshCw
} from "lucide-react";

import { TopSpacing } from "@/components/top-spacing";
import { TextAreaWithActions } from "@/components/text-area-with-actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { handleCopy, handlePaste } from '@/utils/clipboard';
import { encrypt, decrypt } from '@/utils/vigenere';
import { VigenereVariant, VigenereOperation } from '@/types/vigenere';
import FavoriteButton from '@/components/favorite-button';

export default function Vigenere() {
  const [message, setMessage] = useState('');
  const [key, setKey] = useState('');
  const [variant, setVariant] = useState<VigenereVariant>('vigenère');
  const [alphabet, setAlphabet] = useState('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
  const [operation, setOperation] = useState<VigenereOperation>('encrypt');
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const router = useRouter();

  const routeTo = (path: string) => {
    router.push(path);
  };

  const handleProcess = () => {
    if (!message || !key) {
      setError('Message and key are required');
      return;
    }

    setError(null);
    setIsProcessing(true);

    try {
      if (operation === 'encrypt') {
        const encryptedResult = encrypt(message, key, variant, alphabet);
        setResult(encryptedResult);
      } else {
        const decryptedResult = decrypt(message, key, variant, alphabet);
        setResult(decryptedResult);
      }
    } catch (err) {
      setError(`Error processing: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setResult(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClear = () => {
    setMessage('');
    setKey('');
    setResult(null);
    setError(null);
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
              <BreadcrumbPage>Vigenère Cipher</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <TopSpacing />

      {/* Title */}
      <div className="flex items-center justify-center gap-2 my-3">
        <h1 className="text-3xl font-bold my-3 text-center">Vigenère Cipher</h1>
        <FavoriteButton
          toolUrl="/tools/vigenere"
          toolName="Vigenère Cipher"
          iconName="IoLockClosedOutline"
        />
      </div>

      {/* Description */}
      <div className="text-center max-w-2xl mx-auto">
        <p className="text-muted-foreground">
          Vigenère Cipher is a method of encrypting alphabetic text by using a keyword to shift the letters of the plaintext.
        </p>
      </div>

      {/* Content */}
      <div className="mx-8 mt-8 mb-24 flex flex-col gap-5">
        <Card className="flex flex-col p-6 gap-6">
          <TextAreaWithActions
            id="message-input"
            label="Message"
            placeholder="Type or paste your message to encrypt/decrypt..."
            value={message}
            onChange={setMessage}
            onCopy={() => handleCopy(message)}
            onPaste={() => handlePaste(setMessage)}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="key-input" className="text-lg font-semibold">Key</Label>
              <Input
                id="key-input"
                className="mt-3"
                placeholder="Enter your encryption/decryption key"
                value={key}
                onChange={(e) => setKey(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="alphabet-input" className="text-lg font-semibold">Alphabet</Label>
              <Input
                id="alphabet-input"
                className="mt-3"
                placeholder="Set the alphabet for encryption/decryption"
                value={alphabet}
                onChange={(e) => setAlphabet(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-3">
              <Label className="text-lg font-semibold">Variant</Label>
              <Select value={variant} onValueChange={(value) => setVariant(value as VigenereVariant)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select variant" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vigenère">Vigenère</SelectItem>
                  <SelectItem value="autokey">Autokey</SelectItem>
                  <SelectItem value="beaufort">Beaufort</SelectItem>
                  <SelectItem value="gronsfeld">Gronsfeld</SelectItem>
                  <SelectItem value="porta">Porta</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-3">
              <Label className="text-lg font-semibold">Operation</Label>
              <RadioGroup
                value={operation}
                onValueChange={(value: string) => setOperation(value as VigenereOperation)}
                className="flex gap-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="encrypt" id="encrypt" />
                  <Label htmlFor="encrypt">Encrypt</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="decrypt" id="decrypt" />
                  <Label htmlFor="decrypt">Decrypt</Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              onClick={handleProcess}
              className="w-full"
              disabled={isProcessing || !message || !key}
            >
              {isProcessing ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : null}
              Process
            </Button>

            <Button
              onClick={handleClear}
              variant="destructive"
              className="w-full"
            >
              <Trash className="mr-2 h-5 w-5" />
              Clear All
            </Button>
          </div>
        </Card>

        {error && (
          <Alert variant="destructive">
            <CircleAlertIcon className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {result !== null && !error && (
          <Card className="p-6">
            <div className="mb-3">
              <h2 className="text-lg font-semibold">Result:</h2>
            </div>
            <TextAreaWithActions
              id="result-output"
              label=""
              placeholder="Result will appear here..."
              value={result}
              onChange={() => { }}
              onCopy={() => handleCopy(result)}
              onPaste={() => handlePaste(setMessage)}
            />
          </Card>
        )}
      </div>
    </div>
  );
} 