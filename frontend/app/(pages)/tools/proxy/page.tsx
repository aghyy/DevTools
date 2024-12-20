"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Copy } from "lucide-react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function Proxy() {
  const router = useRouter();
  const proxyUrl = "http://localhost:5039/api/tools/proxy";

  const routeTo = (path: string) => {
    router.push(path);
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(proxyUrl);
      alert("Proxy URL copied to clipboard!");
    } catch (err) {
      alert("Failed to copy the URL.");
    }
  }

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
      <h1 className="text-4xl font-extrabold my-6 text-center">Proxy Guide (Demo)</h1>

      {/* Info Section */}
      <div className="mx-8 mt-8 mb-24 flex flex-col gap-10">

        {/* Proxy Information */}
        <Card className="shadow-lg border border-gray-200">
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
            <div className="flex flex-col space-y-2">
              <span className="font-semibold">Usage Example:</span>
              <code className="bg-gray-100 p-3 rounded-md text-sm">
                fetch("{proxyUrl}/example-endpoint", &#123; method: 'GET' &#125;)
              </code>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Badge variant="secondary">Status: Online</Badge>
          </CardFooter>
        </Card>

        {/* How it Works */}
        <Card className="shadow-lg border border-gray-200">
          <CardHeader>
            <CardTitle>📚 How It Works</CardTitle>
            <CardDescription>Here's a quick guide on how to make the most of the proxy.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="list-disc list-inside space-y-2">
              <li>
                <strong>Endpoint Usage:</strong> You can route any request through the proxy using:
                <code className="bg-gray-100 p-1 rounded-md text-sm mx-1">{proxyUrl}/your-endpoint</code>
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

        {/* Possible Improvements */}
        {/* <Card className="shadow-lg border border-gray-200">
          <CardHeader>
            <CardTitle>🚀 Possible Improvements</CardTitle>
            <CardDescription>These are some potential enhancements to extend the proxy's capabilities.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="list-disc list-inside space-y-2">
              <li>Add authentication to prevent abuse of the proxy.</li>
              <li>Limit request size and rate to protect the backend from overload.</li>
              <li>Support file uploads via <span className="font-mono">multipart/form-data</span>.</li>
              <li>Integrate better logging and debugging tools to track incoming requests.</li>
              <li>Implement a caching mechanism for improved performance and reduced latency.</li>
            </ul>
          </CardContent>
        </Card> */}
      </div>
    </div >
  );
}