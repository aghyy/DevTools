"use client";

import api from "@/utils/axios";
import { Bookmark, BookmarkFormData, BookmarkTag, PublicBookmarks } from "@/types/bookmarks";

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
  } catch (error) {
    console.error("Error fetching bookmarks:", error);
    throw error;
  }
};

// Create a new bookmark
export const createBookmark = async (bookmark: BookmarkFormData): Promise<Bookmark> => {
  try {
    const response = await api.post("/api/bookmarks", bookmark);
    return response.data.bookmark;
  } catch (error) {
    console.error("Error creating bookmark:", error);
    throw error;
  }
};

// Get a single bookmark by ID
export const getBookmarkById = async (id: number): Promise<Bookmark> => {
  try {
    const response = await api.get(`/api/bookmarks/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching bookmark with ID ${id}:`, error);
    throw error;
  }
};

// Update a bookmark
export const updateBookmark = async (id: number, bookmark: Partial<BookmarkFormData>): Promise<Bookmark> => {
  try {
    const response = await api.put(`/api/bookmarks/${id}`, bookmark);
    return response.data.bookmark;
  } catch (error) {
    console.error(`Error updating bookmark with ID ${id}:`, error);
    throw error;
  }
};

// Delete a bookmark
export const deleteBookmark = async (id: number): Promise<void> => {
  try {
    await api.delete(`/api/bookmarks/${id}`);
  } catch (error) {
    console.error(`Error deleting bookmark with ID ${id}:`, error);
    throw error;
  }
};

// Get all categories used by the current user
export const getUserCategories = async (): Promise<string[]> => {
  try {
    const response = await api.get("/api/bookmarks/categories");
    return response.data;
  } catch (error) {
    console.error("Error fetching user categories:", error);
    throw error;
  }
};

// Get all tags used by the current user with counts
export const getUserTags = async (): Promise<BookmarkTag[]> => {
  try {
    const response = await api.get("/api/bookmarks/tags");
    return response.data;
  } catch (error) {
    console.error("Error fetching user tags:", error);
    throw error;
  }
};

// Get public bookmarks for a specific user
export const getPublicBookmarks = async (username: string): Promise<PublicBookmarks> => {
  try {
    const response = await api.get(`/api/bookmarks/public/${username}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching public bookmarks for user ${username}:`, error);
    throw error;
  }
}; 