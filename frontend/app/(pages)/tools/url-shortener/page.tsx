"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { apiWithoutCredentials } from "@/utils/axios";
import { Link2, Copy, ExternalLink, Trash, RefreshCw } from "lucide-react";

import { TopSpacing } from "@/components/top-spacing";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { handleCopy } from "@/utils/clipboard";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import FavoriteButton from "@/components/favorite-button";

interface ApiError {
  response?: {
    status: number;
    data?: {
      error?: string;
    };
  };
  message?: string;
}

export default function URLShortener() {
  const router = useRouter();

  const [url, setUrl] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [useCustomCode, setUseCustomCode] = useState(false);
  const [shortenedUrl, setShortenedUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [codeConflict, setCodeConflict] = useState(false);

  const routeTo = (path: string) => {
    router.push(path);
  };

  const handleClear = () => {
    setUrl("");
    setCustomCode("");
    setShortenedUrl(null);
    setError(null);
    setCodeConflict(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset states
    setError(null);
    setShortenedUrl(null);
    setCodeConflict(false);
    setIsLoading(true);

    try {
      // Validate URL
      try {
        new URL(url);
      } catch {
        setError("Invalid URL format. Please enter a valid URL including the protocol (http:// or https://).");
        setIsLoading(false);
        return;
      }

      // Validate custom code if used
      if (useCustomCode && customCode) {
        // Only alphanumeric and hyphens allowed, 3-20 characters
        const codeRegex = /^[a-zA-Z0-9-]{3,20}$/;
        if (!codeRegex.test(customCode)) {
          setError("Custom URL code must be 3-20 characters and can only contain letters, numbers, and hyphens.");
          setIsLoading(false);
          return;
        }
      }

      // Call the API to shorten the URL
      const payload = {
        url,
        ...(useCustomCode && customCode ? { customCode } : {})
      };

      const response = await apiWithoutCredentials.post('/api/tools/shorten-url', payload);

      if (response.data.shortUrl) {
        setShortenedUrl(response.data.shortUrl);
      } else {
        setError("Failed to shorten URL. Please try again.");
      }
    } catch (error: unknown) {
      const apiError = error as ApiError;

      // Handle code conflict error
      if (apiError.response && apiError.response.status === 409) {
        setCodeConflict(true);
        setError("This custom URL code is already taken. Please choose another.");
      } else {
        setError("An error occurred while shortening the URL. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (shortenedUrl) {
      handleCopy(shortenedUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const openUrl = () => {
    if (shortenedUrl) {
      window.open(shortenedUrl, "_blank");
    }
  };

  const generateRandomCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    setCustomCode(result);
  };

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
              <BreadcrumbPage>URL Shortener</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <TopSpacing />

      {/* Title */}
      <div className="flex items-center justify-center gap-2 my-3">
        <h1 className="text-3xl font-bold my-3 text-center">URL Shortener</h1>
        <FavoriteButton
          toolUrl="/tools/url-shortener"
          toolName="URL Shortener"
          iconName="Link"
        />
      </div>

      {/* Content */}
      <div className="mt-8 mb-24 flex flex-col gap-5 max-w-2xl mx-auto">
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Link2 className="h-5 w-5 text-muted-foreground" />
              <div className="font-medium">Enter URL to shorten</div>
            </div>

            <div className="flex gap-2">
              <Input
                type="url"
                placeholder="https://example.com/very/long/url/that/needs/shortening"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1"
                required
              />
            </div>

            <div className="flex items-center space-x-2 mt-2">
              <Switch
                id="custom-url"
                checked={useCustomCode}
                onCheckedChange={setUseCustomCode}
              />
              <Label htmlFor="custom-url">Use custom URL code <span className="text-muted-foreground italic">(returns local URL)</span></Label>
            </div>

            {useCustomCode && (
              <div className="flex gap-2 mt-2">
                <Input
                  type="text"
                  placeholder="my-custom-code"
                  value={customCode}
                  onChange={(e) => setCustomCode(e.target.value)}
                  className={`flex-1 ${codeConflict ? 'border-red-500' : ''}`}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={generateRandomCode}
                  title="Generate random code"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading || !url.trim() || (useCustomCode && !customCode.trim())}
              className="mt-2"
            >
              {isLoading ? "Shortening..." : "Shorten URL"}
            </Button>
          </form>
        </Card>

        {/* Results */}
        {shortenedUrl && (
          <Card className="p-6 mt-4">
            <div className="flex items-center gap-2 mb-3">
              <Link2 className="h-5 w-5 text-green-500" />
              <div className="font-medium">Shortened URL</div>
            </div>

            <div className="bg-muted p-3 rounded-md mb-4 text-sm break-all">
              {shortenedUrl}
            </div>

            <div className="flex gap-2 mt-2">
              <Button variant="outline" onClick={copyToClipboard} className="flex-1">
                <Copy className="h-4 w-4 mr-2" />
                {copySuccess ? "Copied!" : "Copy"}
              </Button>
              <Button variant="outline" onClick={openUrl} className="flex-1">
                <ExternalLink className="h-4 w-4 mr-2" />
                Open
              </Button>
            </div>
          </Card>
        )}

        {/* Error Message */}
        {error && (
          <Card className="p-4 mt-4 border-destructive bg-destructive/10">
            <p className="text-destructive">{error}</p>
          </Card>
        )}

        {/* Clear Button */}
        {(shortenedUrl || error) && (
          <Button
            onClick={handleClear}
            variant="destructive"
            className="mt-2"
          >
            <Trash className="h-4 w-4 mr-2" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}