import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

export const apiWithoutCredentials = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

export default api;