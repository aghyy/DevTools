"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

import { TopSpacing } from "@/components/top-spacing";

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

  const routeTo = (path: string) => {
    router.push(path);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // For the sake of this example, just simulate shortening a URL.
    if (url) {
      const randomString = Math.random().toString(36).substring(7); // Simulated short URL
      setShortenedUrl(`https://short.url/${randomString}`);
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
      <h1 className="text-3xl font-bold my-3 text-center">URL Shortener (Demo)</h1>

      {/* Content */}
      <div className="mx-8 mt-8 mb-24 flex flex-col gap-5">
        <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4">
          <input
            type="url"
            placeholder="Enter URL to shorten"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="p-2 border border-gray-300 rounded-lg w-full max-w-md"
            required
          />
          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded-lg mt-2 w-full max-w-md hover:bg-blue-700"
          >
            Shorten URL
          </button>
        </form>

        {shortenedUrl && (
          <div className="text-center mt-4">
            <p className="font-semibold">Shortened URL:</p>
            <a
              href={shortenedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline"
            >
              {shortenedUrl}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}