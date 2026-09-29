import axios from "axios";
import { useAuthStore } from "../store/authStore";

const http = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL
});

http.interceptors.request.use((config) => {
  const url = config.url || "";

  const isAuthLogin =
    url.includes("/api/users/login") ||
    url.includes("/api/users/refresh-token") ||
    url.includes("/api/stores/login") ||
    url.includes("/api/stores/refresh-token");

  // ✅ ADD THIS LINE
  const { token, storeToken, selectedStore, storeUser } = useAuthStore.getState();
  const storedSelectedStoreId = localStorage.getItem("selectedStoreId");

  if (isAuthLogin) {
    return config;
  }

  const activeToken = storeToken || token;

  // ✅ Token attach (already correct)
  if (activeToken) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${activeToken}`;
  }

  // 🆕 ✅ ADD THIS BLOCK (IMPORTANT)
  const storeId =
    selectedStore?.id ||
    selectedStore?.storeId ||
    storeUser?.storeId ||
    storedSelectedStoreId;

  if (storeId) {
    config.params = {
      ...config.params,
      storeId,
    };
  }

  return config;
});

let refreshPromise = null;

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    const isAuthExcluded =
      originalRequest?.url?.includes("/api/users/login") ||
      originalRequest?.url?.includes("/api/users/refresh-token") ||
      originalRequest?.url?.includes("/api/stores/login") ||
      originalRequest?.url?.includes("/api/stores/refresh-token");

    const { refreshToken, storeToken, storeRefreshToken } = useAuthStore.getState();
    const usingStoreSession = Boolean(storeToken);

    if (status === 401 && !originalRequest._retry && !isAuthExcluded) {
      originalRequest._retry = true;

      try {
        const currentRefreshToken = usingStoreSession
          ? storeRefreshToken
          : refreshToken;

        if (!currentRefreshToken) {
          useAuthStore.getState().logout();
          window.location.href = "/login";
          return Promise.reject(error);
        }

        const refreshUrl = usingStoreSession
          ? "/api/stores/refresh-token"
          : "/api/users/refresh-token";

        refreshPromise =
          refreshPromise ||
          axios.post(`${import.meta.env.VITE_API_BASE_URL}${refreshUrl}`, {
            refreshToken: currentRefreshToken,
          });

        const response = await refreshPromise;
        refreshPromise = null;

        const nextToken =
          response.data?.accessToken ||
          response.data?.token ||
          response.data?.data?.accessToken ||
          response.data?.data?.token;
        const nextRefreshToken =
          response.data?.refreshToken || response.data?.data?.refreshToken;

        if (nextToken) {
          if (usingStoreSession) {
            useAuthStore.getState().setStoreSession({
              storeUser: useAuthStore.getState().storeUser,
              storeToken: nextToken,
              storeRefreshToken: nextRefreshToken || currentRefreshToken,
            });
          } else {
            useAuthStore.getState().setSession({
              user: useAuthStore.getState().user,
              token: nextToken,
              refreshToken: nextRefreshToken || currentRefreshToken,
            });
          }
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${nextToken}`;
          return http(originalRequest);
        }
      } catch (refreshError) {
        refreshPromise = null;
        useAuthStore.getState().logout();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        refreshPromise = null;
      }
    }

    return Promise.reject(error);
  }
);

export default http;
