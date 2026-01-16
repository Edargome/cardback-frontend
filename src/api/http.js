import axios from "axios";
import { getTokens, setTokens, clearTokens } from "../auth/authStore";

// Cambia esto si tu API usa otro puerto/host
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5256";

export const http = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// --- Inyectar access token en cada request ---
http.interceptors.request.use((config) => {
  const { accessToken } = getTokens();
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

// --- Refresh automático (una sola vez por request) ---
let isRefreshing = false;
let refreshQueue = [];

function processQueue(error, newAccessToken) {
  refreshQueue.forEach((p) => (error ? p.reject(error) : p.resolve(newAccessToken)));
  refreshQueue = [];
}

http.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    const status = err.response?.status;

    // Si no es 401, o ya reintentamos, devolvemos error
    if (status !== 401 || original._retry) return Promise.reject(err);

    // Si no hay refresh token, cerrar sesión
    const { refreshToken, accessToken } = getTokens();
    if (!refreshToken || !accessToken) {
      clearTokens();
      return Promise.reject(err);
    }

    // Marcar retry
    original._retry = true;

    // Si ya hay refresh en curso, encola y espera
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push({
          resolve: (newToken) => {
            original.headers.Authorization = `Bearer ${newToken}`;
            resolve(http(original));
          },
          reject,
        });
      });
    }

    // Iniciar refresh
    isRefreshing = true;

    try {
      const resp = await axios.post(
        `${BASE_URL}/auth/refresh`,
        { accessToken, refreshToken },
        { headers: { "Content-Type": "application/json" } }
      );

      const newAccessToken = resp.data.accessToken;
      const newRefreshToken = resp.data.refreshToken;

      setTokens({ accessToken: newAccessToken, refreshToken: newRefreshToken });

      processQueue(null, newAccessToken);

      original.headers.Authorization = `Bearer ${newAccessToken}`;
      return http(original);
    } catch (refreshErr) {
      processQueue(refreshErr, null);
      clearTokens();
      return Promise.reject(refreshErr);
    } finally {
      isRefreshing = false;
    }
  }
);
