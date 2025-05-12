"use client"

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

import { Trash } from "lucide-react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

import { TopSpacing } from "@/components/top-spacing";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { FileUpload } from "@/components/ui/file-upload";
import { Textarea } from '@/components/ui/textarea';

// F5 Algorithm Implementation
class F5Steganography {
  // Convert message to byte array
  private static stringToBytes(str: string): number[] {
    return Array.from(new TextEncoder().encode(str));
  }

  // Convert byte array to string
  private static bytesToString(bytes: number[]): string {
    return new TextDecoder().decode(new Uint8Array(bytes));
  }

  // Improved random sequence generation with a proper distribution
  private static generateRandomSequence(length: number, seed: number): number[] {
    const sequence: number[] = Array.from({ length }, (_, i) => i);
    let current = seed;

    for (let i = sequence.length - 1; i > 0; i--) {
      current = (current * 1664525 + 1013904223) & 0x7fffffff;
      const j = current % (i + 1);
      [sequence[i], sequence[j]] = [sequence[j], sequence[i]]; // Swap elements
    }

    return sequence;
  }

  // Embed a bit using least significant bit manipulation
  private static embedBit(pixelValue: number, bit: number): number {
    return (pixelValue & 0xFE) | (bit & 1); // Set LSB based on bit
  }

  // Extract least significant bit from a pixel value
  private static extractBit(pixelValue: number): number {
    return pixelValue & 1;
  }

  // Matrix encoding with better bounds checking and logic
  private static matrixEncode(cover: Uint8ClampedArray, message: number[], seed: number = 12345): Uint8ClampedArray {
    const encodedData = new Uint8ClampedArray(cover);
    let messageIndex = 0;
    let bitPosition = 7;
    const randomSequence = this.generateRandomSequence(Math.floor(cover.length / 4), seed);

    for (const pixelIndex of randomSequence) {
      const baseIndex = pixelIndex * 4;

      if (baseIndex + 3 >= cover.length) break; // Ensure we don't go out of bounds

      for (let channel = 0; channel < 3; channel++) {
        const channelIndex = baseIndex + channel;
        if (messageIndex >= message.length) break;

        const messageBit = (message[messageIndex] >> bitPosition) & 1;
        encodedData[channelIndex] = this.embedBit(encodedData[channelIndex], messageBit);

        bitPosition--;
        if (bitPosition < 0) {
          messageIndex++;
          bitPosition = 7;
        }
      }
    }

    return encodedData;
  }

  // Matrix decoding with improved handling of bounds and bit logic
  private static matrixDecode(encodedData: Uint8ClampedArray, messageLength: number, seed: number = 12345): number[] {
    const message: number[] = [];
    let currentByte = 0;
    let bitPosition = 7;
    const randomSequence = this.generateRandomSequence(Math.floor(encodedData.length / 4), seed);

    for (const pixelIndex of randomSequence) {
      const baseIndex = pixelIndex * 4;

      if (baseIndex + 3 >= encodedData.length) break; // Ensure we don't go out of bounds

      for (let channel = 0; channel < 3; channel++) {
        const channelIndex = baseIndex + channel;

        const extractedBit = this.extractBit(encodedData[channelIndex]);
        currentByte = (currentByte << 1) | extractedBit;
        bitPosition--;

        if (bitPosition < 0) {
          message.push(currentByte);
          currentByte = 0;
          bitPosition = 7;
        }

        if (message.length === messageLength) return message;
      }
    }

    return message;
  }

  // Main encode method with UTF-8 support and error handling
  static encode(coverImage: ImageData, message: string, password: string): ImageData {
    try {
      const fullMessage = `${message}|${password}`;
      const messageBytes = this.stringToBytes(fullMessage);
      const lengthBytes = [
        (messageBytes.length >> 24) & 0xFF,
        (messageBytes.length >> 16) & 0xFF,
        (messageBytes.length >> 8) & 0xFF,
        messageBytes.length & 0xFF
      ];
      const completeMessage = [...lengthBytes, ...messageBytes];

      const encodedData = this.matrixEncode(coverImage.data, completeMessage);
      return new ImageData(
        new Uint8ClampedArray(encodedData), 
        coverImage.width, 
        coverImage.height
      );
    } catch (error) {
      console.error('Encoding Error:', error);
      throw new Error('Failed to encode the image.');
    }
  }

  // Main decode method with error handling
  static decode(encodedImage: ImageData, password: string): string | null {
    try {
      const lengthBytes = this.matrixDecode(encodedImage.data, 4);
      const messageLength =
        (lengthBytes[0] << 24) |
        (lengthBytes[1] << 16) |
        (lengthBytes[2] << 8) |
        lengthBytes[3];

      const decodedBytes = this.matrixDecode(encodedImage.data, messageLength + 4);
      const fullMessage = this.bytesToString(decodedBytes.slice(4));

      const delimiterIndex = fullMessage.lastIndexOf('|');
      if (delimiterIndex === -1) throw new Error('Message delimiter not found.');

      const message = fullMessage.slice(0, delimiterIndex);
      const storedPassword = fullMessage.slice(delimiterIndex + 1);

      if (password !== storedPassword) {
        console.warn('Incorrect password.');
        return null;
      }

      return message;
    } catch (error) {
      console.error('Decoding Error:', error);
      return null;
    }
  }
}

const Steganography: React.FC = () => {
  // State for encoding
  const [message, setMessage] = useState('');
  const [password, setPassword] = useState('');
  const [baseImage, setBaseImage] = useState<string | null>(null);
  const [encodedImage, setEncodedImage] = useState<string | null>(null);

  const [decodeFiles, setDecodeFiles] = useState<File[]>([]);
  const [encodeFiles, setEncodeFiles] = useState<File[]>([]);

  // State for decoding
  const [decodePassword, setDecodePassword] = useState('');
  const [decodedMessage, setDecodedMessage] = useState('');

  const router = useRouter();

  const routeTo = (path: string) => {
    router.push(path);
  }

  // Handle base image selection for encoding
  const handleBaseImageSelect = (files: File[]) => {
    const file = files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setBaseImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Encode process
  const handleEncode = () => {
    if (message.length > 1000) {
      alert('Message exceeds 1000 characters');
      return;
    }

    if (!baseImage) {
      alert('Please select a base image to encode your message');
      return;
    }

    // Create canvas to manipulate image
    const img = document.createElement('img');
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');

      if (!ctx) return;

      // Draw original image
      ctx.drawImage(img, 0, 0);

      // Get image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      try {
        // Encode message using F5 algorithm
        const encodedImageData = F5Steganography.encode(imageData, message, password);

        // Put modified image data back
        ctx.putImageData(encodedImageData, 0, 0);

        // Convert to data URL
        const encodedDataUrl = canvas.toDataURL('image/png');
        setEncodedImage(encodedDataUrl);
      } catch (error) {
        alert('Encoding failed: ' + error);
      }
    };
    img.src = baseImage;
  };

  // Decode process
  const handleDecode = () => {
    if (!decodeFiles?.length) {
      alert('Please select an image to decode');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = document.createElement('img');
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');

        if (!ctx) return;

        // Draw image
        ctx.drawImage(img, 0, 0);

        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        try {
          // Decode message using F5 algorithm
          const decodedMessage = F5Steganography.decode(imageData, decodePassword);

          if (decodedMessage !== null) {
            setDecodedMessage(decodedMessage);
          } else {
            setDecodedMessage('Incorrect password or no hidden message');
          }
        } catch (error) {
          alert('Decoding failed: ' + error);
        }
      };
      img.src = e.target?.result as string;
    };

    const file = decodeFiles[0];
    reader.readAsDataURL(file);
  };

  // Clear all fields
  const handleClear = () => {
    setMessage('');
    setPassword('');
    setBaseImage(null);
    setEncodedImage(null);
    setDecodePassword('');
    setDecodedMessage('');
    setDecodeFiles([]);
    setEncodeFiles([]);
  };

  const handleEncodeChange = (files: File[]) => {
    setDecodeFiles([]);
    setEncodeFiles(files);
    handleBaseImageSelect(files);
    setEncodedImage(null);
    setDecodePassword('');
    setDecodedMessage('');
    setBaseImage(null);
  }

  const handleDecodeChange = (files: File[]) => {
    setEncodeFiles([]);
    setDecodeFiles(files);
    handleBaseImageSelect([]);
    setMessage('');
    setPassword('');
    setEncodedImage(null);
    setBaseImage(null);
  }

  // Render remains the same as previous implementation
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
              <BreadcrumbPage>Steganography</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <TopSpacing />

      {/* Title */}
      <h1 className="text-3xl font-bold my-3 text-center">F5 Steganography</h1>

      <div className="mx-8 mt-8 mb-24 flex flex-col gap-5">
        <div className="flex flex-col gap-5 md:flex-row">
          <Card className='p-6 flex-1'>

            {/* Encode Section */}
            <div>
              <h2 className="text-lg font-semibold mb-2">Encode</h2>
              <p className="text-sm text-muted-foreground mb-2">
                Select a base image, type your message, and add a password
              </p>

              {/* Base Image Selection */}
              <FileUpload keyProp='encode' files={encodeFiles} onChange={handleEncodeChange} />

              {/* Preview of Base Image */}
              {baseImage && (
                <div className="mb-10">
                  <Image
                    src={baseImage}
                    alt="Base Image"
                    className="w-auto max-h-96 mx-auto mb-2"
                    width={500}
                    height={500}
                    style={{ maxHeight: '24rem', width: 'auto' }}
                    unoptimized
                  />
                </div>
              )}

              <Textarea
                className="min-h-[100px] p-2 mb-2"
                placeholder="Enter your message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={1000}
              />

              <Input
                type="password"
                autoComplete="off"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mb-2"
              />

              <Button onClick={handleEncode} className="w-full">
                Hide Message
              </Button>
            </div>
          </Card>

          <Card className='p-6 flex-1'>
            {/* Decode Section */}
            <div className='h-full flex flex-col justify-between'>
              <div>
                <h2 className="text-lg font-semibold mb-2">Decode</h2>
                <p className="text-sm text-muted-foreground mb-2">
                  Import an encoded image and enter the password
                </p>

                <FileUpload keyProp='decode' files={decodeFiles} onChange={handleDecodeChange} />

                <Input
                  type="password"
                  autoComplete="off"
                  placeholder="Enter password"
                  value={decodePassword}
                  onChange={(e) => setDecodePassword(e.target.value)}
                  className="mb-2"
                />
              </div>

              <Button onClick={handleDecode} className="w-full">
                Reveal Message
              </Button>
            </div>
          </Card>
        </div>

        {(decodedMessage || encodedImage) &&
          <Card className='p-6 flex-1'>
            {/* Results Section */}
            {encodedImage && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Encoded Image</h3>
                <Image
                  src={encodedImage}
                  alt="Encoded"
                  className="w-auto max-h-96 mx-auto mb-2"
                  width={500}
                  height={500}
                  style={{ maxHeight: '24rem', width: 'auto' }}
                  unoptimized
                />
                <Button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.download = 'encoded-image.png';
                    link.href = encodedImage;
                    link.click();
                  }}
                  className="w-full mt-2"
                >
                  Download Encoded Image
                </Button>
              </div>
            )}

            {decodedMessage && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Hidden Message</h3>
                <div className="border p-2 rounded-sm">
                  {decodedMessage}
                </div>
              </div>
            )}
          </Card>
        }

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
};

export default Steganography;