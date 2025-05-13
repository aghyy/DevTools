"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, Copy, Trash } from "lucide-react";
import { v4 as uuidv4 } from 'uuid';
import { v1 as uuidv1 } from 'uuid';
import { v3 as uuidv3 } from 'uuid';
import { v5 as uuidv5 } from 'uuid';
import { NIL as NIL_UUID } from 'uuid';

import { TopSpacing } from "@/components/top-spacing";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import FavoriteButton from "@/components/favorite-button";
import { handleCopy } from '@/utils/clipboard';

// UUID namespace constants
const NAMESPACE_DNS = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
const NAMESPACE_URL = '6ba7b811-9dad-11d1-80b4-00c04fd430c8';

export default function UuidGenerator() {
  const [uuids, setUuids] = useState<string[]>([uuidv4()]);
  const [quantity, setQuantity] = useState(1);
  const [version, setVersion] = useState("v4");
  const [namespace, setNamespace] = useState(NAMESPACE_DNS);
  const [name, setName] = useState("example.com");

  const router = useRouter();

  const routeTo = (path: string) => {
    router.push(path);
  };

  const generateUuids = () => {
    const newUuids: string[] = [];

    for (let i = 0; i < quantity; i++) {
      switch (version) {
        case "nil":
          newUuids.push(NIL_UUID);
          break;
        case "v1":
          newUuids.push(uuidv1());
          break;
        case "v3":
          newUuids.push(uuidv3(name, namespace));
          break;
        case "v4":
          newUuids.push(uuidv4());
          break;
        case "v5":
          newUuids.push(uuidv5(name, namespace));
          break;
        default:
          newUuids.push(uuidv4());
      }
    }

    setUuids(newUuids);
  };

  const handleVersionChange = (value: string) => {
    setVersion(value);
    generateUuids();
  };

  const handleNamespaceChange = (value: string) => {
    setNamespace(value);
    if (version === "v3" || version === "v5") {
      generateUuids();
    }
  };

  const handleQuantityChange = (value: number) => {
    const newQuantity = Math.max(1, Math.min(100, value));
    setQuantity(newQuantity);

    if (newQuantity > uuids.length) {
      // Generate more UUIDs
      const newUuids = [...uuids];
      for (let i = uuids.length; i < newQuantity; i++) {
        switch (version) {
          case "nil":
            newUuids.push(NIL_UUID);
            break;
          case "v1":
            newUuids.push(uuidv1());
            break;
          case "v3":
            newUuids.push(uuidv3(name, namespace));
            break;
          case "v4":
            newUuids.push(uuidv4());
            break;
          case "v5":
            newUuids.push(uuidv5(name, namespace));
            break;
          default:
            newUuids.push(uuidv4());
        }
      }
      setUuids(newUuids);
    } else if (newQuantity < uuids.length) {
      // Reduce number of UUIDs
      setUuids(uuids.slice(0, newQuantity));
    }
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
              <BreadcrumbPage>UUID Generator</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <TopSpacing />

      {/* Title with Favorite Button */}
      <div className="flex items-center justify-center gap-2 my-3">
        <h1 className="text-3xl font-bold text-center">UUID Generator</h1>
        <FavoriteButton
          toolUrl="/tools/uuid-generator"
          toolName="UUID Generator"
          iconName="Fingerprint"
        />
      </div>

      {/* Description */}
      <div className="text-center max-w-2xl mx-auto">
        <p className="text-muted-foreground">
          A Universally Unique Identifier (UUID) is a 128-bit number used to identify information in
          computer systems. The number of possible UUIDs is 16<sup>32</sup>, which is 2<sup>128</sup> or about
          3.4×10<sup>38</sup> (which is a lot!).
        </p>
      </div>

      <div className="mx-8 mt-8 mb-24 flex flex-col gap-5">
        {/* Options Card */}
        <Card className="flex flex-col p-6 gap-6">
          <h2 className="text-xl font-semibold">UUID Options</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Version Selection */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="uuid-version">UUID Version</Label>
              <Select value={version} onValueChange={handleVersionChange}>
                <SelectTrigger id="uuid-version">
                  <SelectValue placeholder="Select Version" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nil">NIL</SelectItem>
                  <SelectItem value="v1">V1 (time-based)</SelectItem>
                  <SelectItem value="v3">V3 (namespace, MD5)</SelectItem>
                  <SelectItem value="v4">V4 (random)</SelectItem>
                  <SelectItem value="v5">V5 (namespace, SHA-1)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Quantity Selection */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between">
                <Label htmlFor="uuid-quantity">Quantity</Label>
                <span className="text-xs text-muted-foreground px-1">Max: 100</span>
              </div>
              <Input
                id="uuid-quantity"
                type="number"
                min={1}
                max={100}
                value={quantity}
                onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
              />
            </div>
          </div>

          {/* Namespace options for v3 and v5 */}
          {(version === "v3" || version === "v5") && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <Label htmlFor="namespace">Namespace</Label>
                <Select value={namespace} onValueChange={handleNamespaceChange}>
                  <SelectTrigger id="namespace">
                    <SelectValue placeholder="Select Namespace" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NAMESPACE_DNS}>DNS</SelectItem>
                    <SelectItem value={NAMESPACE_URL}>URL</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (e.target.value) {
                      generateUuids();
                    }
                  }}
                  placeholder="example.com"
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between">
            <Button
              variant="destructive"
              onClick={() => {
                setUuids([version === "nil" ? NIL_UUID : uuidv4()]);
                setQuantity(1);
              }}
            >
              <Trash className="h-4 w-4 mr-2" />
              Clear
            </Button>
            <Button onClick={generateUuids}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </Card>

        {/* Generated UUIDs */}
        <Card className="flex flex-col p-6 gap-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Generated UUIDs</h2>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleCopy(uuids.join('\n'))}
              className="gap-2"
            >
              <Copy className="h-4 w-4" />
              Copy All
            </Button>
          </div>

          <div className="flex flex-col gap-2">
            {uuids.map((uuid, index) => (
              <div key={index} className="flex gap-2 items-center">
                <Input
                  value={uuid}
                  readOnly
                  className="font-mono"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleCopy(uuid)}
                  className="h-10 w-10 flex-shrink-0"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
} 