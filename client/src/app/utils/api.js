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
  console.log("Current Token:", token);
  return token;
};

api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
      const status = response.status;

      if (status === 401) {
        if (typeof window !== "undefined") {
          const path = window.location.pathname;

          if (path !== "/login" && path !== "/signup") {
            console.warn("Session Expired. Cleaning up...");

            document.cookie =
              "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
            localStorage.removeItem("token");
            localStorage.removeItem("user");

            window.location.href = "/login";
          }
        }
      }
      return Promise.reject(response.data);
    }

    return Promise.reject({ message: "Network error, check your connection." });
  },
);

export default api;
