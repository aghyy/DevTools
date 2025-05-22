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
  try {
    if (!email) {
      const error = "Email field is required";
      toast.error(error);
      throw new Error(error);
    }

    const response = await api.post("/api/auth/forgot-password", { email });
    
    // Always show success message regardless of whether the email exists
    // This is a security best practice to prevent email enumeration
    toast.success("If this email is registered, you will receive a reset link.");
    return response.data;
  } catch (error) {
    // If there's an error, still show the same message for security
    toast.success("If this email is registered, you will receive a reset link.");
    throw error;
  }
};

export const resetPassword = async (
  token: string,
  newPassword: string,
  confirmPassword: string
) => {
  try {
    const response = await api.post("/api/auth/reset-password", {
      token,
      new_password: newPassword,
      confirm_password: confirmPassword,
    });
    
    if (response.status === 200) {
      toast.success("Password has been reset successfully");
    } else {
      const error = response.data.message || "Failed to reset password. Please try again.";
      toast.error(error);
      throw new Error(error);
    }
    
    return response.data;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to reset password. Please try again.";
    toast.error(errorMessage);
    throw error;
  }
};

export const getUserDetails = async () => {
  try {
    const response = await api.get("/api/auth/user");
    return response.data;
  } catch {
    return null;
  }
};

export const uploadAvatar = async (file: File) => {
  const formData = new FormData();
  formData.append('avatar', file);

  const response = await api.post('/api/auth/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

export const removeAvatar = async () => {
  const response = await api.delete('/api/auth/avatar');
  return response.data;
};

export const updateProfile = async (data: {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
}) => {
  try {
    const response = await api.put("/api/auth/profile", data);
    return response.data;
  } catch {
    throw new Error('Failed to update profile');
  }
};

export const changePassword = async (data: {
  currentPassword: string;
  newPassword: string;
}) => {
  try {
    const response = await api.put("/api/auth/password", data);
    return response.data;
  } catch {
    throw new Error('Failed to change password');
  }
};

export const updateNotificationPreferences = async (data: {
  emailNotifications: boolean;
  pushNotifications: boolean;
  marketingEmails: boolean;
}) => {
  try {
    const response = await api.put("/api/auth/notifications", data);
    return response.data;
  } catch {
    throw new Error('Failed to update notification preferences');
  }
};

export const updatePrivacySettings = async (data: {
  profileVisibility: 'public' | 'private' | 'connections';
  showEmail: boolean;
  showActivity: boolean;
}) => {
  try {
    const response = await api.put("/api/auth/privacy", data);
    return response.data;
  } catch {
    throw new Error('Failed to update privacy settings');
  }
};
