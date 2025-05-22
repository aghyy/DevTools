import axios, { AxiosError } from "axios";
import { toast } from "sonner";

interface ErrorResponse {
  message?: string;
}

const handleError = (error: AxiosError<ErrorResponse>) => {
  if (error.response) {
    // Handle specific error messages from backend
    const message = error.response.data?.message;
    
    // Don't show error for unauthorized (401) as it's handled by auth flow
    if (error.response.status !== 401) {
      toast.error(message || "Something went wrong. Please try again.");
    }
  } else if (error.request) {
    // Network error
    toast.error("Network error. Please check your connection.");
  } else {
    // Other errors
    toast.error("Something went wrong. Please try again.");
  }
  return Promise.reject(error);
};

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  handleError
);

export const apiWithoutCredentials = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

apiWithoutCredentials.interceptors.response.use(
  (response) => response,
  handleError
);

export default api;