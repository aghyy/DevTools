import api from "@/utils/axios";

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
    console.error(
      `Error tracking activity (${activity.type}:${activity.name}):`,
      apiError.response?.data || apiError.message
    );

    // If the error is due to authentication, don't retry
    if (apiError.response?.status === 401) {
      console.log("Authentication required. Activity not tracked.");
      throw error;
    }

    // For other errors (like network issues), retry once after a delay
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        try {
          console.log("Retrying activity tracking...");
          const retryResponse = await api.post("/api/activities", activity);
          resolve(retryResponse.data);
        } catch (retryError) {
          console.error("Retry failed:", retryError);
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
  } catch (error: unknown) {
    const apiError = error as ApiError;
    console.error(
      "Error fetching recent activities:",
      apiError.response?.data || apiError.message
    );
    throw error;
  }
};

// Get activity statistics
export const getActivityStats = async () => {
  try {
    const response = await api.get("/api/activities/stats");
    return response.data as ActivityStats;
  } catch (error: unknown) {
    const apiError = error as ApiError;
    console.error(
      "Error fetching activity stats:",
      apiError.response?.data || apiError.message
    );
    throw error;
  }
};

// Get most used items
export const getMostUsedItems = async (limit: number = 5) => {
  try {
    const response = await api.get(`/api/activities/most-used?limit=${limit}`);
    return response.data as MostUsedItem[];
  } catch (error: unknown) {
    const apiError = error as ApiError;
    console.error(
      "Error fetching most used items:",
      apiError.response?.data || apiError.message
    );
    throw error;
  }
};
