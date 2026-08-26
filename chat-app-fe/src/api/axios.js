import axios from "axios";

export const API_URL ="https://chat-app-2-98p2.onrender.com";

const api = axios.create({
  baseURL: `https://chat-app-2-98p2.onrender.com/api`,
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
