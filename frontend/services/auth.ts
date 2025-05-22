import api from "@/utils/axios";
import { toast } from "sonner";

export const login = async (identifier: string, password: string) => {
  try {
    const response = await api.post("/api/auth/login", {
      identifier,
      password,
    });
    if (response.status === 200) {
      toast.success("Logged in successfully");
    }
    return response.data;
  } catch {
    return null;
  }
};

export const createAccount = async (
  firstName: string,
  lastName: string,
  username: string,
  email: string,
  password: string
) => {
  try {
    const response = await api.post("/api/auth/create-account", {
      firstName,
      lastName,
      username,
      email,
      password,
    });
    if (response.status === 201) {
      toast.success("Account created successfully");
    }
    return response.data;
  } catch {
    return null;
  }
};

export const logout = async () => {
  try {
    const response = await api.post("/api/auth/logout");
    if (response.status === 200) {
      toast.success("Logged out successfully");
    }
    return response.data;
  } catch {
    return null;
  }
};

export const sendResetLink = async (email: string) => {
  try {
    if (!email) {
      toast.error("Email field is required");
      return;
    }

    await api.post("/api/auth/forgot-password", { email });
    // Always show success message regardless of whether the email exists
    // This is a security best practice to prevent email enumeration
    toast.success("If this email is registered, you will receive a reset link");
  } catch {
    // Error is handled by axios interceptor
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
    }
    return response.data;
  } catch {
    return null;
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
  formData.append("avatar", file);

  try {
    const response = await api.post("/api/auth/avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch {
    return null;
  }
};

export const removeAvatar = async () => {
  try {
    const response = await api.delete("/api/auth/avatar");
    return response.data;
  } catch {
    return null;
  }
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
    return null;
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
    return null;
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
    return null;
  }
};

export const updatePrivacySettings = async (data: {
  profileVisibility: "public" | "private" | "connections";
  showEmail: boolean;
  showActivity: boolean;
}) => {
  try {
    const response = await api.put("/api/auth/privacy", data);
    return response.data;
  } catch {
    return null;
  }
};
