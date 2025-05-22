"use client";

import api from "@/utils/axios";
import { Bookmark, BookmarkFormData, BookmarkTag, PublicBookmarks } from "@/types/bookmarks";
import { toast } from "sonner";

// Get all bookmarks for the current user
export const getUserBookmarks = async (
  category?: string,
  tag?: string,
  search?: string
): Promise<Bookmark[]> => {
  try {
    let url = "/api/bookmarks";
    const params = new URLSearchParams();
    
    if (category) params.append("category", category);
    if (tag) params.append("tag", tag);
    if (search) params.append("search", search);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    const response = await api.get(url);
    return response.data;
  } catch {
    toast.error("Failed to fetch bookmarks.");
    return [];
  }
};

// Get a specific bookmark by ID
export const getBookmarkById = async (id: number): Promise<Bookmark> => {
  try {
    const response = await api.get(`/api/bookmarks/${id}`);
    return response.data;
  } catch {
    toast.error(`Failed to fetch bookmark ${id}.`);
    return {} as Bookmark;
  }
};

// Create a new bookmark
export const createBookmark = async (data: BookmarkFormData): Promise<Bookmark> => {
  try {
    const response = await api.post("/api/bookmarks", data);
    return response.data.bookmark;
  } catch {
    toast.error("Failed to create bookmark.");
    return {} as Bookmark;
  }
};

// Update an existing bookmark
export const updateBookmark = async (id: number, data: BookmarkFormData): Promise<Bookmark> => {
  try {
    const response = await api.put(`/api/bookmarks/${id}`, data);
    return response.data.bookmark;
    } catch {
    toast.error(`Failed to update bookmark ${id}.`);
    return {} as Bookmark;
  }
};

// Delete a bookmark
export const deleteBookmark = async (id: number): Promise<void> => {
  try {
    await api.delete(`/api/bookmarks/${id}`);
  } catch {
    toast.error(`Failed to delete bookmark ${id}.`);
  }
};

// Get user categories
export const getUserCategories = async (): Promise<string[]> => {
  try {
    const response = await api.get("/api/bookmarks/categories");
    return response.data;
  } catch {
    toast.error("Failed to fetch user categories.");
    return [];
  }
};

// Get user tags with counts
export const getUserTags = async (): Promise<BookmarkTag[]> => {
  try {
    const response = await api.get("/api/bookmarks/tags");
    return response.data;
  } catch {
    toast.error("Failed to fetch user tags.");
    return [];
  }
};

// Get public bookmarks for a specific user
export const getPublicBookmarks = async (username: string): Promise<PublicBookmarks> => {
  try {
    const response = await api.get(`/api/bookmarks/public/${username}`);
    return response.data;
  } catch {
    toast.error(`Failed to fetch public bookmarks for user ${username}.`);
    return {} as PublicBookmarks;
  }
};

// Get all public bookmarks from all users
export const getAllPublicBookmarks = async (): Promise<{ user: string; username: string; bookmarks: Bookmark[] }[]> => {
  try {
    const response = await api.get('/api/bookmarks/public');
    return response.data;
  } catch {
    toast.error("Failed to fetch all public bookmarks.");
    return [];
  }
}; 