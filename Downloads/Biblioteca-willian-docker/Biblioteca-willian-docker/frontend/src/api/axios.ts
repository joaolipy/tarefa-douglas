import axios from "axios";
import { clearToken, getToken } from "./token";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:3000",
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const requestUrl = error.config?.url ?? "";
      if (!requestUrl.includes("/auth/login")) {
        clearToken();
        if (window.location.pathname !== "/login") window.location.assign("/login");
      }
    }
    return Promise.reject(error);
  },
);
