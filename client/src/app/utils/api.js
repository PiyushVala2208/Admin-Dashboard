import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
  timeout: 15000, 
  headers: {
    "Content-Type": "application/json",
  },
});

const getCookie = (name) => {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
};

api.interceptors.request.use(
  (config) => {
    const token = getCookie("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const { response, request } = error;

    if (response) {
      const status = response.status;

      switch (status) {
        case 401:
          const isLoginPage = typeof window !== "undefined" && window.location.pathname === "/login";
          if (!isLoginPage) {
            document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            localStorage.removeItem("user");
            if (typeof window !== "undefined") {
              window.location.href = "/login";
            }
          }
          break;

        case 403:
          console.error("Access Forbidden: You do not have permission for this action.");
          break;

        case 404:
          console.error("Resource Not Found: The requested endpoint does not exist.");
          break;

        case 500:
          console.error("Internal Server Error: Something went wrong on the server.");
          break;

        default:
          console.error(`API Error (${status}):`, response.data?.message || "An unexpected error occurred.");
      }
    } else if (request) {
      if (error.code === 'ECONNABORTED') {
        console.error("Request Timeout: The server is taking too long to respond.");
      } else {
        console.error("Network Error: Please check your internet connection or backend server status.");
      }
    } else {
      console.error("Configuration Error:", error.message);
    }

    return Promise.reject(error);
  }
);

export default api;