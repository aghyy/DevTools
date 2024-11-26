import api from "@/utils/axios";

export const login = async (identifier: string, password: string) => {
  try {
    const response = await api.post("/api/users/login", { identifier, password });
    console.log(response.data.message);
    return response.data;
  } catch (error: any) {
    console.log("Login error:", error.response?.data || error.message);
    throw error
  }
};

export const logout = async () => {
  try {
    const response = await api.post("/api/users/logout");
    if (response.status === 200) {
      console.log("Successfully logged out.");
    } else {
      console.log("Unexpected response status:", response.status);
    }
  } catch (error: any) {
    console.log("Logout error:", error.response?.data || error.message);
    throw error;
  }
};

export const getUser = async () => {
  try {
    const response = await api.get("/api/users");
    return response.data;
  } catch (error: any) {
    console.log("Error fetching user data:", error.response?.data || error.message);
    throw error;
  }
};

export const sendResetLink = async (email: string) => {
  // try {
  //   const response = await api.post("/api/users/reset-password", { email });
  //   console.log(response.data.message);
  //   return response.data;
  // } catch (error: any) {
  //   console.log("Error sending reset link:", error.response?.data || error.message);
  //   throw error;
  // }
}