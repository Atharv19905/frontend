import axios from "axios";

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000"
});

// ✅ Attach JWT (skip for auth routes)
API.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {

        const url = config.url || "";

        const isAuthRoute =
            url.includes("/auth/login") ||
            url.includes("/auth/signup");

        if (!isAuthRoute) {
            const token = localStorage.getItem("token");
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
    }
    return config;
});

// ✅ Handle 401 properly
API.interceptors.response.use(
    (r) => r,
    (err) => {
        if (err?.response?.status === 401 && typeof window !== "undefined") {

            const url = err.config?.url || "";

            const isAuthRoute =
                url.includes("/auth/login") ||
                url.includes("/auth/signup");

            if (!isAuthRoute) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");

                if (!location.pathname.startsWith("/login")) {
                    location.href = "/login";
                }
            }
        }

        return Promise.reject(err);
    }
);

export default API;