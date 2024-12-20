"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, Copy } from "lucide-react";

import { handleCopy } from "@/utils/clipboard";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function JSONFormatter() {
  const router = useRouter();

  const routeTo = (path: string) => {
    router.push(path);
  }

  const [jsonInput, setJsonInput] = useState('');
  const [validationStatus, setValidationStatus] = useState<'valid' | 'invalid' | null>(null);
  const [formattedJson, setFormattedJson] = useState<string>('');

  const handleFormatJson = () => {
    try {
      const parsedJson = JSON.parse(jsonInput);
      const formatted = JSON.stringify(parsedJson, null, 2);
      setFormattedJson(formatted);
      setValidationStatus('valid');
    } catch (error) {
      setValidationStatus('invalid');
    }
  }

  const handleValidateJson = () => {
    try {
      JSON.parse(jsonInput);
      setValidationStatus('valid');
    } catch (error) {
      setValidationStatus('invalid');
    }
  }

  const handleClear = () => {
    setJsonInput('');
    setFormattedJson('');
    setValidationStatus(null);
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
              <BreadcrumbPage>JSON Formatter</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Top Spacing */}
      <div className="pt-16"></div>

      {/* Title */}
      <h1 className="text-3xl font-bold my-3 text-center">JSON Formatter & Validator</h1>

      <div className="mx-8 mt-8 mb-24 flex flex-col gap-10">

        {/* Input Section */}
        <Card className="shadow-lg border border-gray-200">
          <CardHeader>
            <CardTitle>✍️ JSON Input</CardTitle>
            <CardDescription>Enter your JSON here to validate and format it.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder="Paste your raw JSON here..."
              className="h-40"
            />
            <div className="flex justify-end space-x-3">
              <Button variant="destructive" onClick={handleClear}>
                Clear
              </Button>
              <Button variant="secondary" onClick={handleValidateJson}>
                Validate
              </Button>
              <Button variant="default" onClick={handleFormatJson}>
                Format
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Validation Result */}
        {validationStatus && (
          <Card className={`shadow-lg border ${validationStatus === 'valid' ? 'border-green-500' : 'border-red-500'}`}>
            <CardHeader>
              <CardTitle>{validationStatus === 'valid' ? '✅ Valid JSON' : '❌ Invalid JSON'}</CardTitle>
              <CardDescription>
                {validationStatus === 'valid'
                  ? 'Your JSON is valid. You can format it or copy it below.'
                  : 'The JSON is invalid. Please correct it and try again.'
                }
              </CardDescription>
            </CardHeader>
            {validationStatus === 'invalid' && (
              <CardContent>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="text-red-500" size={20} />
                  <span className="text-red-500">Invalid JSON. Please check the syntax.</span>
                </div>
              </CardContent>
            )}
          </Card>
        )}

        {/* Formatted JSON Output */}
        {formattedJson && (
          <Card className="shadow-lg border border-gray-200">
            <CardHeader>
              <CardTitle>📜 Formatted JSON</CardTitle>
              <CardDescription>This is the formatted version of your JSON.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={formattedJson}
                readOnly
                className="h-40 bg-gray-100"
              />
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => handleCopy(formattedJson)}>
                  <Copy size={18} className="mr-2" />
                  Copy to Clipboard
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
}