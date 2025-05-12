"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { apiWithoutCredentials } from "@/utils/axios";
import { Link2, Copy, ExternalLink, Trash } from "lucide-react";

import { TopSpacing } from "@/components/top-spacing";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { handleCopy } from "@/utils/clipboard";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function URLShortener() {
  const router = useRouter();

  const [url, setUrl] = useState("");
  const [shortenedUrl, setShortenedUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const routeTo = (path: string) => {
    router.push(path);
  };

  const handleClear = () => {
    setUrl("");
    setShortenedUrl(null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset states
    setError(null);
    setShortenedUrl(null);
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

      // Call the API to shorten the URL
      const response = await apiWithoutCredentials.post('/api/tools/shorten-url', { url });
      
      if (response.data.shortUrl) {
        setShortenedUrl(response.data.shortUrl);
      } else {
        setError("Failed to shorten URL. Please try again.");
      }
    } catch (error) {
      console.error("Error shortening URL:", error);
      setError("An error occurred while shortening the URL. Please try again.");
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
      <h1 className="text-3xl font-bold my-3 text-center">URL Shortener</h1>
      <p className="text-muted-foreground text-center">Convert long URLs into short, manageable links</p>

      {/* Content */}
      <div className="mx-8 mt-8 mb-24 flex flex-col gap-5 max-w-2xl mx-auto">
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
              <Button type="submit" disabled={isLoading || !url.trim()}>
                {isLoading ? "Shortening..." : "Shorten"}
              </Button>
            </div>
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