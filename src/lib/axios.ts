import axios from "axios";

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api/v1",
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
      window.localStorage.removeItem("accessToken");
      window.localStorage.removeItem("refreshToken");
      document.cookie =
        "powerline_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }

    return Promise.reject(error);
  },
);
