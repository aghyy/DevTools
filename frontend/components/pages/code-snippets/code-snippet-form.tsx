"use client";

import React, { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { X, Plus, Globe, Lock, Code2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CodeSnippet, CodeSnippetFormData } from "@/types/code-snippets";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CodeHighlighter } from "./code-highlighter";

// Common programming languages
const PROGRAMMING_LANGUAGES = [
  "JavaScript",
  "TypeScript",
  "Python",
  "Java",
  "C",
  "C++",
  "C#",
  "Go",
  "Ruby",
  "PHP",
  "Swift",
  "Kotlin",
  "Rust",
  "Bash",
  "HTML",
  "CSS",
  "SQL",
  "JSON",
  "YAML",
  "Markdown",
  "Other"
];

// Form schema using zod
const formSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  code: z.string().min(1, "Code is required"),
  language: z.string().min(1, "Language is required"),
  description: z.string().optional(),
  isPublic: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
});

interface CodeSnippetFormProps {
  initialData?: CodeSnippet;
  onSubmit: (data: CodeSnippetFormData) => void;
  onCancel: () => void;
  isProcessing?: boolean;
}

export const CodeSnippetForm: React.FC<CodeSnippetFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isProcessing = false,
}) => {
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [tagInput, setTagInput] = useState("");
  const [previewMode, setPreviewMode] = useState(false);
  
  // Set default form values
  const defaultValues = {
    title: initialData?.title || "",
    code: initialData?.code || "",
    language: initialData?.language || "",
    description: initialData?.description || "",
    isPublic: initialData?.isPublic || false,
    tags: initialData?.tags || [],
  };
  
  // Initialize form with any type to avoid TypeScript errors
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues,
  });
  
  // Keep form tags in sync with state
  useEffect(() => {
    form.setValue("tags", tags);
  }, [tags, form]);
  
  // Handle tag input
  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    }
  };
  
  const addTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setTagInput("");
    }
  };
  
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  // Form submission handler
  const handleSubmit = (data: Record<string, unknown>) => {
    onSubmit({
      title: data.title as string,
      code: data.code as string,
      language: data.language as string,
      description: data.description as string | undefined,
      isPublic: data.isPublic as boolean,
      tags: tags,
    });
  };

  // Get current code and language for preview
  const currentCode = form.watch("code");
  const currentLanguage = form.watch("language");
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title *</FormLabel>
                <FormControl>
                  <Input placeholder="Snippet title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="language"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Language *</FormLabel>
                <FormControl>
                  <Select 
                    value={field.value} 
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a language" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROGRAMMING_LANGUAGES.map((lang) => (
                        <SelectItem key={lang} value={lang}>
                          {lang}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Add a brief description of this code snippet" 
                    {...field} 
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <div className="flex justify-between items-center">
                  <FormLabel>Code *</FormLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setPreviewMode(!previewMode)}
                  >
                    {previewMode ? "Edit" : "Preview"}
                  </Button>
                </div>
                <FormControl>
                  {previewMode ? (
                    <div className="border rounded-md p-1 min-h-[200px]">
                      {currentCode ? (
                        <CodeHighlighter 
                          code={currentCode} 
                          language={currentLanguage || "plaintext"} 
                        />
                      ) : (
                        <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                          <Code2 className="mr-2" size={18} />
                          No code to preview
                        </div>
                      )}
                    </div>
                  ) : (
                    <Textarea 
                      placeholder="Paste or type your code here" 
                      {...field} 
                      className="font-mono min-h-[200px]"
                    />
                  )}
                </FormControl>
                <FormDescription>
                  Paste or type the code you want to save
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div>
            <FormLabel>Tags</FormLabel>
            <div className="flex mt-2 mb-1">
              <Input
                placeholder="Add tags and press Enter"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagInputKeyDown}
                className="flex-grow"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={addTag}
                className="ml-2"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs py-1 px-2">
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 text-xs opacity-70 hover:opacity-100"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              {tags.length === 0 && (
                <div className="text-xs text-muted-foreground py-1">
                  No tags added yet
                </div>
              )}
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <FormField
            control={form.control}
            name="isPublic"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base flex items-center">
                    {field.value ? (
                      <Globe className="mr-2 h-4 w-4" />
                    ) : (
                      <Lock className="mr-2 h-4 w-4" />
                    )}
                    {field.value ? "Public" : "Private"}
                  </FormLabel>
                  <FormDescription>
                    {field.value 
                      ? "This code snippet will be visible to others" 
                      : "Only you can see this code snippet"}
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex justify-end gap-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isProcessing}>
            {isProcessing ? "Saving..." : initialData ? "Update" : "Add Snippet"}
          </Button>
        </div>
      </form>
    </Form>
  );
}; 