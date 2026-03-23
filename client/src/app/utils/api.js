import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

const getAuthToken = () => {
  if (typeof window === "undefined") return null;

  const name = "token=";
  const decodedCookie = decodeURIComponent(document.cookie);
  const ca = decodedCookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i].trim();
    if (c.indexOf(name) === 0) return c.substring(name.length, c.length);
  }

  return localStorage.getItem("token");
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
      const message = response.data?.message || "An unexpected error occurred.";

      if (status === 401) {
        if (typeof window !== "undefined") {
          const path = window.location.pathname;

          if (path !== "/login" && path !== "/signup") {
            document.cookie =
              "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
            localStorage.removeItem("token");
            localStorage.removeItem("user");

            window.location.href = "/login";
          }
        }
      }

      console.error(`[API Error ${status}]:`, message);

      return Promise.reject(response.data);
    }

    console.error("Network Error: Backend unreachable.");
    return Promise.reject({ message: "Network error, check your server." });
  },
);

export default api;
