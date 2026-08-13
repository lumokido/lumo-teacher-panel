import axios, {
    AxiosError,
    AxiosInstance,
    AxiosRequestConfig,
    AxiosResponse,
    InternalAxiosRequestConfig,
  } from "axios";
import { Alphores_TOKEN_KEY } from "@/lib/auth/constants";
import { toast } from "sonner";

  // const API_BASE_URL = "http://localhost:5050";
  
  // const API_BASE_URL = "http://localhost:8080";
   const API_BASE_URL = "https://api.lumokido.in";
  // const API_BASE_URL=     "https://java-production-a727.up.railway.app"

  
  /**
   * Main API instance
   */
  export const api: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      "Content-Type": "application/json",
    },
  });
  
  /**
   * Separate instance WITHOUT interceptors for refresh
   */
  const refreshApi: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      "Content-Type": "application/json",
    },
  });
  
  let isRefreshing = false;
  let refreshSubscribers: ((token: string) => void)[] = [];
  
  function subscribeTokenRefresh(cb: (token: string) => void) {
    refreshSubscribers.push(cb);
  }
  
  function onRefreshed(token: string) {
    refreshSubscribers.forEach((cb) => cb(token));
    refreshSubscribers = [];
  }
  
  function getUserRole(): "principal" | "teacher" | null {
    if (typeof window === "undefined") return null;

    const type = localStorage.getItem("type");
    if (type === "principal" || type === "teacher") return type;
    return null;
  }

  function getAccessToken(): string | null {
    if (typeof window === "undefined") return null;

    return (
      localStorage.getItem("accessToken") ||
      localStorage.getItem(Alphores_TOKEN_KEY)
    );
  }

  function getRefreshToken(): string | null {
    if (typeof window === "undefined") return null;

    return localStorage.getItem("refreshToken");
  }

  function setAccessToken(token: string) {
    if (typeof window === "undefined") return;

    localStorage.setItem("accessToken", token);
    localStorage.setItem(Alphores_TOKEN_KEY, token);
  }

  function setRefreshToken(token: string) {
    if (typeof window === "undefined") return;

    localStorage.setItem("refreshToken", token);
  }

  function clearTokens() {
    if (typeof window === "undefined") return;

    localStorage.removeItem("accessToken");
    localStorage.removeItem(Alphores_TOKEN_KEY);
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("type");
  }
  
 
  
  api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = getAccessToken();
  
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
  
      return config;
    },
    (error: AxiosError) => Promise.reject(error),
  );
  
  api.interceptors.response.use(
    (response: AxiosResponse) => response,
  
    async (error: AxiosError) => {
      const originalRequest = error.config as AxiosRequestConfig & {
        _retry?: boolean;
      };
  
      if (!error.response) {
        toast.error("Network error");
        return Promise.reject(error);
      }
  
      const status = error.response.status;
  
      if (status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
  
        const refreshToken = getRefreshToken();
  
        if (!refreshToken) {
          console.warn("No refresh token available");
          return Promise.reject(error);
        }
  
        if (isRefreshing) {
          return new Promise((resolve) => {
            subscribeTokenRefresh((token: string) => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              resolve(api(originalRequest));
            });
          });
        }
  
        isRefreshing = true;
  
        try {
          const role = getUserRole();
          const refreshUrl = role === "teacher"
            ? "/api/admin/login-teacher/refresh-token"
            : "/api/admin/refresh-token";

          const response = await refreshApi.post(refreshUrl, {
            refreshToken,
          });
  
          console.log("Refresh response:", response);
  
          // Safely extract access/refresh token from various response formats
          const newAccessToken =
            response.data?.accessToken ||
            response.data?.data?.accessToken ||
            response.data?.token ||
            response.data?.data?.token;

          const newRefreshToken =
            response.data?.refreshToken ||
            response.data?.data?.refreshToken;

          console.log("New tokens:", { newAccessToken, newRefreshToken });
  
          if (newAccessToken) {
            setAccessToken(newAccessToken);
          }
          if (newRefreshToken) {
            setRefreshToken(newRefreshToken);
          }
  
          onRefreshed(newAccessToken || "");
  
          // toast.success("Session refreshed");
  
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }
  
          return api(originalRequest);
        } catch (refreshError) {
          console.log("Refresh error:", refreshError);
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }
  
      return Promise.reject(error);
    },
  );
  
 
  
  export default api;
  
