import axios, { AxiosError } from "axios";
import { trackActivity } from "@/services/activity";

// Define the FavoriteTool interface
export interface FavoriteTool {
  id: number;
  userId: number;
  toolUrl: string;
  toolName: string;
  icon: string | null;
  createdAt: string;
  updatedAt: string;
}

// API endpoint
const API_URL = "http://localhost:5039/api/favorite-tools";

// Configure axios to include credentials
const api = axios.create({
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Add a tool to favorites
 */
export const addToFavorites = async (
  toolUrl: string,
  toolName: string,
  icon?: string
): Promise<FavoriteTool> => {
  try {
    const response = await api.post(API_URL, { toolUrl, toolName, icon });
    
    // Track activity after adding to favorites
    await trackActivity({
      type: "favorite",
      name: toolName,
      path: toolUrl,
      icon: icon || "Heart",
    });
    
    return response.data.favoriteTool;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<{ message: string }>;
    throw new Error(
      axiosError.response?.data?.message || "Failed to add tool to favorites"
    );
  }
};

/**
 * Get all favorite tools for the current user
 */
export const getFavoriteTools = async (): Promise<FavoriteTool[]> => {
  try {
    const response = await api.get(API_URL);
    return response.data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<{ message: string }>;
    throw new Error(
      axiosError.response?.data?.message || "Failed to fetch favorite tools"
    );
  }
};

/**
 * Remove a tool from favorites
 */
export const removeFromFavorites = async (id: number): Promise<void> => {
  try {
    // Get the favorite info before deleting (to track activity)
    const favorites = await getFavoriteTools();
    const favorite = favorites.find(f => f.id === id);
    
    await api.delete(`${API_URL}/${id}`);
    
    // If we found the favorite, track the removal as activity
    if (favorite) {
      await trackActivity({
        type: "favorite",
        name: `Removed: ${favorite.toolName}`,
        path: favorite.toolUrl,
        icon: favorite.icon || "Heart",
      });
    }
  } catch (error: unknown) {
    const axiosError = error as AxiosError<{ message: string }>;
    throw new Error(
      axiosError.response?.data?.message ||
        "Failed to remove tool from favorites"
    );
  }
};

/**
 * Check if a tool is in favorites
 */
export const isToolInFavorites = async (toolUrl: string): Promise<boolean> => {
  try {
    const favorites = await getFavoriteTools();
    return favorites.some((tool) => tool.toolUrl === toolUrl);
  } catch (error) {
    console.error("Error checking if tool is in favorites:", error);
    return false;
  }
};

/**
 * Update the positions of favorite tools
 */
export const updateFavoritePositions = async (positions: { id: number; position: number }[]): Promise<void> => {
  try {
    await api.put(`${API_URL}/positions`, { positions });
  } catch (error: unknown) {
    const axiosError = error as AxiosError<{ message: string }>;
    throw new Error(
      axiosError.response?.data?.message ||
        "Failed to update favorite positions"
    );
  }
};
