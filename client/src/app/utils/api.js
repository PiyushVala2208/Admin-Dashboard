import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
  timeout: 10000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

const getAuthToken = () => {
  if (typeof window === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )token=([^;]+)"));
  const token = match ? match[2] : localStorage.getItem("token");
  return token;
};

const clearClientSession = () => {
  if (typeof window === "undefined") return;

  document.cookie =
    "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax;";
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;

    if (response) {
      if (response.status === 401) {
        if (typeof window !== "undefined") {
          const path = window.location.pathname;

          if (path !== "/login" && path !== "/signup" && path !== "/register") {
            clearClientSession();
            window.location.replace("/login");
          }
        }
      }

      return Promise.reject(
        response.data || {
          message: "Request failed.",
          status: response.status,
        },
      );
    }

    return Promise.reject({
      message: "Network error, please check your server.",
    });
  },
);

export default api;
