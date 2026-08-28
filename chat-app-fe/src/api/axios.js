import axios from "axios";

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: `${API_URL}/api`,   // <-- "/api" is added here already
});

// NOTE ON AUTH HEADER FORMAT
// The backend's auth.middleware.js does:
//   const token = req.headers.authorization;
//   jwt.verify(token, ...)
// It reads the header value AS the raw token — it does NOT strip a
// "Bearer " prefix (even though API.md shows "Authorization: Bearer <token>").
// So we send the raw token here. If the backend is later updated to do
// `authHeader.split(" ")[1]`, change this to `Bearer ${token}`.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = token;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);

export default api;
