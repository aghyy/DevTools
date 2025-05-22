import api from "@/utils/axios";
import { toast } from "sonner";

// Interface for basic activity data
export interface Activity {
  id?: number;
  userId?: number;
  type: "tool" | "bookmark" | "favorite" | "codeSnippet";
  name: string;
  path: string;
  icon: string;
  createdAt?: string;
  updatedAt?: string;
}

// Interface for statistics
export interface ActivityStats {
  tools: number;
  bookmarks: number;
  favorites: number;
  codeSnippets: number;
  total: number;
}

// Interface for most used items
export interface MostUsedItem
  extends Omit<Activity, "userId" | "createdAt" | "updatedAt"> {
  count: number;
}

// API error type
interface ApiError {
  response?: {
    data?: unknown;
    status?: number;
  };
  message: string;
}

// Track a new activity
export const trackActivity = async (
  activity: Omit<Activity, "userId" | "id" | "createdAt" | "updatedAt">
) => {
  try {
    const response = await api.post("/api/activities", activity);
    return response.data;
  } catch (error: unknown) {
    const apiError = error as ApiError;
    // Add useful debug info
    toast.error(`Error tracking activity (${activity.type}:${activity.name})`);

    // If the error is due to authentication, don't retry
    if (apiError.response?.status === 401) {
      toast.error("Authentication required. Activity not tracked.");
      return;
    }

    // For other errors (like network issues), retry once after a delay
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        try {
          const retryResponse = await api.post("/api/activities", activity);
          resolve(retryResponse.data);
        } catch (retryError) {
          toast.error("Retry failed.");
          reject(retryError);
        }
      }, 2000); // 2-second delay before retry
    });
  }
};

// Get user's recent activities
export const getRecentActivities = async () => {
  try {
    const response = await api.get(`/api/activities`);
    return response.data as Activity[];
  } catch {
    toast.error(`Error fetching recent activities`);
    return [];
  }
};

// Get activity statistics
export const getActivityStats = async () => {
  try {
    const response = await api.get("/api/activities/stats");
    return response.data as ActivityStats;
  } catch {
    toast.error(`Error fetching activity stats`);
    return null;
  }
};

// Get most used items
export const getMostUsedItems = async (limit: number = 5) => {
  try {
    const response = await api.get(`/api/activities/most-used?limit=${limit}`);
    return response.data as MostUsedItem[];
  } catch {
    toast.error(`Error fetching most used items`);
    return [];
  }
};
