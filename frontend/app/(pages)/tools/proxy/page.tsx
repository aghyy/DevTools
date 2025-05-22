"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ClipboardCopy, Copy, Globe } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import Image from "next/image";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import { allExamples, ExampleOption } from ".";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { handleCopy } from "@/utils/clipboard";
import FavoriteButton from "@/components/favorite-button";
import { toast } from "sonner";

export default function Proxy() {
  const router = useRouter();
  const proxyUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/tools/proxy?url=`;
  const [targetUrl, setTargetUrl] = useState("https://jsonplaceholder.typicode.com/todos/1");
  const [selectedExampleId, setSelectedExampleId] = useState("javascript-fetch");

  // For the Live Test card
  const [testUrl, setTestUrl] = useState("https://jsonplaceholder.typicode.com/todos/1");
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<null | {
    data: unknown;
    status: number;
    headers: Record<string, string>;
    error?: string;
    errorDetails?: string;
  }>(null);

  // Get the current example
  const getCurrentExample = (): ExampleOption => {
    const example = allExamples.find(ex => ex.id === selectedExampleId);
    return example || allExamples[0];
  };

  const routeTo = (path: string) => {
    router.push(path);
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(proxyUrl);
      toast.success("Proxy URL copied to clipboard!");
    } catch {
      toast.error("Failed to copy the URL.");
    }
  }

  // Get the code example based on selected language
  const getCodeExample = (): string => {
    const example = getCurrentExample();
    if (!example) return "// No example available";

    // Replace both placeholder variables
    return example.code
      .replace(/\$PROXY_URL\$/g, proxyUrl)
      .replace(/\$TARGET_URL\$/g, targetUrl);
  };

  // Make a test request through the proxy
  const makeProxyRequest = async () => {
    if (!testUrl.trim()) return;

    setIsLoading(true);
    setResponse(null);

    try {
      const fullUrl = `${proxyUrl}${testUrl}`;
      const res = await fetch(fullUrl);

      // Get headers
      const headers: Record<string, string> = {};
      res.headers.forEach((value, key) => {
        headers[key] = value;
      });

      // Check if the response is an error
      if (!res.ok) {
        // Try to parse the error response
        try {
          const errorData = await res.json();
          setResponse({
            data: null,
            status: res.status,
            headers,
            error: errorData.error || `Error: ${res.status} ${res.statusText}`,
            errorDetails: errorData.details || ''
          });
          return;
        } catch {
          // If we can't parse the error as JSON, use the status text
          setResponse({
            data: null,
            status: res.status,
            headers,
            error: `Error: ${res.status} ${res.statusText}`
          });
          return;
        }
      }

      // Get response data for successful responses
      let data;
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        data = await res.text();
      }

      setResponse({
        data,
        status: res.status,
        headers
      });
    } catch (error) {
      setResponse({
        data: null,
        status: 0,
        headers: {},
        error: error instanceof Error ? error.message : 'An unknown error occurred',
        errorDetails: 'There was a problem connecting to the proxy server. Please check your connection and try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full w-full">
      {/* Breadcrumb Navigation */}
      <div className="relative size-0">
        <Breadcrumb className="absolute left-20 top-[22px] w-max">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink className="cursor-pointer" onClick={() => routeTo('/tools')}>Tools</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Proxy</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Top Spacing */}
      <div className="pt-16"></div>

      {/* Title */}
      <div className="flex items-center justify-center gap-2 my-3">
        <h1 className="text-3xl font-bold my-3 text-center">Proxy</h1>
        <FavoriteButton
          toolUrl="/tools/proxy"
          toolName="Proxy"
          iconName="Waypoints"
        />
      </div>

      {/* Description */}
      <div className="text-center max-w-2xl mx-auto">
        <p className="text-muted-foreground">
          A proxy server is a server that acts as an intermediary between a client and a server. It can be used to handle CORS issues, but it can also be used for other purposes.
        </p>
      </div>

      {/* Info Section */}
      <div className="mx-8 mt-8 mb-24 flex flex-col gap-10">
        {/* Proxy Information */}
        <Card>
          <CardHeader>
            <CardTitle>📡 Proxy Overview</CardTitle>
            <CardDescription>This proxy is primarily used to handle CORS issues, but it can be utilized for other purposes as well.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="font-semibold min-w-fit">Proxy URL:</span>
              <Input value={proxyUrl} readOnly className="w-full" />
              <Button onClick={copyToClipboard} variant="outline">
                <Copy size={18} className="mr-2" />
                Copy
              </Button>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-semibold min-w-fit">Target URL:</span>
              <Input
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder="Enter target API URL"
                className="w-full"
              />
            </div>
            <div className="flex flex-col space-y-2">
              <span className="font-semibold">Usage Examples:</span>
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <span>Select example:</span>
                <Select value={selectedExampleId} onValueChange={setSelectedExampleId}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select example" />
                  </SelectTrigger>
                  <SelectContent>
                    {allExamples.map((example) => (
                      <SelectItem key={example.id} value={example.id}>
                        <div className="flex items-center gap-2">
                          <div className="relative w-5 h-5">
                            <Image
                              src={example.icon}
                              alt={example.label}
                              width={20}
                              height={20}
                              className="object-contain"
                            />
                          </div>
                          <span>{example.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <code className="bg-primary/5 p-6 rounded-md text-sm whitespace-pre overflow-x-auto relative">
                <div className="absolute top-2 right-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <span>
                          <div
                            onClick={() => handleCopy(getCodeExample())}
                            className="p-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-[hsl(var(--secondary-hover))] border font-sans"
                          >
                            <ClipboardCopy className="h-3 w-3" />
                          </div>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>Copy</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                {getCodeExample()}
              </code>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Badge variant="secondary">Status: Online</Badge>
          </CardFooter>
        </Card>

        {/* Live Test Card */}
        <Card>
          <CardHeader>
            <CardTitle>🧪 Live Test</CardTitle>
            <CardDescription>Test the proxy with any URL and see the response in real-time.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Input
                value={testUrl}
                onChange={(e) => setTestUrl(e.target.value)}
                placeholder="Enter URL to test"
                className="flex-1"
              />
              <Button
                onClick={makeProxyRequest}
                disabled={isLoading}
                className="min-w-[120px]"
              >
                {isLoading ? "Loading..." : "Send Request"}
              </Button>
            </div>

            <div className="mt-4">
              {response ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge className={response.error ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}>
                      Status: {response.error ? "Error" : response.status}
                    </Badge>
                    {!response.error &&
                      <Badge variant="outline" className="text-xs">
                        Content-Type: {response.headers['content-type'] || 'Unknown'}
                      </Badge>
                    }
                  </div>

                  <div className="bg-black/5 dark:bg-white/5 rounded-md p-4 max-h-[400px] overflow-auto">
                    <div className="font-semibold mb-2">Response:</div>
                    {response.error ? (
                      <div className="space-y-2">
                        <div className="text-red-600 dark:text-red-400 font-semibold">{response.error}</div>
                        {response.errorDetails && (
                          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {response.errorDetails}
                          </div>
                        )}
                      </div>
                    ) : (
                      <pre className="text-xs whitespace-pre-wrap break-words font-mono">
                        {typeof response.data === 'object' && response.data !== null
                          ? JSON.stringify(response.data, null, 2)
                          : String(response.data)}
                      </pre>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-gray-500">
                  <Globe size={40} className="mb-3 opacity-30" />
                  <p>Enter a URL and click &quot;Send Request&quot; to test the proxy</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* How it Works */}
        <Card>
          <CardHeader>
            <CardTitle>📚 How It Works</CardTitle>
            <CardDescription>Here&apos;s a quick guide on how to make the most of the proxy.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="list-disc list-inside space-y-2">
              <li>
                <strong>Endpoint Usage:</strong> You can route any request through the proxy using:
                <code className="bg-gray-100 dark:bg-secondary p-1 rounded-md text-sm mx-1">{proxyUrl}your-endpoint</code>
              </li>
              <li>
                <strong>Example Use Case:</strong> If an API you need has CORS restrictions, simply prepend the proxy URL to your API call.
              </li>
              <li>
                <strong>Supported Methods:</strong> The proxy supports <span className="font-mono">GET</span>, <span className="font-mono">POST</span>, <span className="font-mono">PUT</span>, and <span className="font-mono">DELETE</span> requests.
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div >
  );
}