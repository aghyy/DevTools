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
import { X, Plus, Globe, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Bookmark, BookmarkFormData } from "@/types/bookmarks";

// Form schema using zod
const formSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  url: z.string().url("Please enter a valid URL"),
  description: z.string().optional(),
  category: z.string().optional(),
  isPublic: z.boolean(),
  tags: z.array(z.string()).optional(),
});

type BookmarkFormValues = z.infer<typeof formSchema>;

interface BookmarkFormProps {
  initialData?: Bookmark;
  onSubmit: (data: BookmarkFormData) => void;
  onCancel: () => void;
  isProcessing?: boolean;
}

export const BookmarkForm: React.FC<BookmarkFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isProcessing = false,
}) => {
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [tagInput, setTagInput] = useState("");
  
  // Set default form values
  const defaultValues: BookmarkFormValues = {
    title: initialData?.title || "",
    url: initialData?.url || "",
    description: initialData?.description || "",
    category: initialData?.category || "",
    isPublic: initialData?.isPublic ?? false,
    tags: initialData?.tags || [],
  };
  
  // Initialize form
  const form = useForm<BookmarkFormValues>({
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
  
  // Handle form submission
  const onFormSubmit = (data: BookmarkFormValues) => {
    onSubmit({
      ...data,
      tags: tags,
    });
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-6">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title *</FormLabel>
                <FormControl>
                  <Input placeholder="Bookmark title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL *</FormLabel>
                <FormControl>
                  <Input placeholder="https://example.com" {...field} />
                </FormControl>
                <FormDescription>
                  The link to the bookmark resource
                </FormDescription>
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
                    placeholder="Add a brief description of this bookmark resource" 
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
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="e.g. JavaScript, Python, Docker" 
                    {...field} 
                    value={field.value || ""}
                  />
                </FormControl>
                <FormDescription>
                  Categorize your bookmarks for easier organization
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
                      ? "This bookmark will be visible to others" 
                      : "Only you can see this bookmark"}
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
            {isProcessing ? "Saving..." : initialData ? "Update" : "Add Link"}
          </Button>
        </div>
      </form>
    </Form>
  );
}; 