import api from "@/utils/axios";
import { toast } from "sonner";

export const login = async (identifier: string, password: string) => {
  try {
    const response = await api.post("/api/auth/login", {
      identifier,
      password,
    });
    if (response.status !== 200) {
      console.error("Login failed:", response);
      const error = "Invalid username or password.";
      toast.error(error);
      throw new Error(error);
    }
    return response.data;
  } catch {
    const error = "Invalid username or password.";
    toast.error(error);
    throw new Error(error);
  }
};

export const signup = async (
  firstName: string,
  lastName: string,
  username: string,
  email: string,
  password: string
) => {
  try {
    const response = await api.post("/api/auth/signup", {
      firstName,
      lastName,
      username,
      email,
      password,
    });
    if (response.status === 201) {
      toast.success("Signed up successfully.");
    } else {
      const error = "Failed to sign up. Please try again.";
      toast.error(error);
      throw new Error(error);
    }
  } catch {
    const error = "Failed to sign up. Please try again.";
    toast.error(error);
    throw new Error(error);
  }
};

export const logout = async () => {
  try {
    const response = await api.post("/api/auth/logout");
    if (response.status === 200) {
      toast.success("Logged out successfully.");
    } else {
      const error = "Failed to log out. Please try again.";
      toast.error(error);
      throw new Error(error);
    }
  } catch {
    const error = "Failed to log out. Please try again.";
    toast.error(error);
    throw new Error(error);
  }
};

export const sendResetLink = async (email: string) => {
  const response = await api.post("/api/auth/forgot-password", { email });
  return response.data;
};

export const resetPassword = async (
  uid: string,
  token: string,
  newPassword: string,
  confirmPassword: string
) => {
  const response = await api.post("/api/auth/reset-password", {
    uid,
    token,
    new_password: newPassword,
    confirm_password: confirmPassword,
  });
  return response.data;
};

export const getUserDetails = async () => {
  try {
    const response = await api.get("/api/auth/user");
    return response.data;
  } catch {
    return null;
  }
};
