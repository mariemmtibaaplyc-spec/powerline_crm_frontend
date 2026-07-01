import axios from "axios";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useSessionStore } from "@/store/session.store";

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api/v1",
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const sessionToken = useSessionStore.getState().session?.accessToken ?? null;
    const authToken = useAuthStore.getState().session?.accessToken ?? null;
    const storageToken = localStorage.getItem("accessToken");
    const token = sessionToken ?? authToken ?? storageToken;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;

      if (storageToken !== token) {
        localStorage.setItem("accessToken", token);
      }
    } else if (config.headers.Authorization) {
      delete config.headers.Authorization;
    }
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== "undefined" && axios.isAxiosError(error) && error.response?.status === 401) {
      useSessionStore.getState().clearSession();
      useAuthStore.getState().setSession(null);
      window.localStorage.removeItem("accessToken");
      window.localStorage.removeItem("refreshToken");
      // Expire both the legacy and better-auth session cookies
      const expired = "; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = "powerline_session=" + expired;
      document.cookie = "better-auth.session_token=" + expired;
    }

    return Promise.reject(error);
  },
);
