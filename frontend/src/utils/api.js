import axios from "axios";
import { API_URL } from "./config";
import { API_TOKEN_KEY } from "./authConstants";

export const api = axios.create({
  baseURL: API_URL || undefined,
  timeout: 8000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

export async function checkApiHealth() {
  if (!API_URL) return false;
  try {
    const healthUrl = API_URL.replace(/\/v1\/?$/, "/health");
    await axios.get(healthUrl, { timeout: 3000 });
    return true;
  } catch {
    return false;
  }
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(API_TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLogin = error.config?.url?.includes("/login");
    if (error.response?.status === 401 && !isLogin) {
      clearApiToken();
      sessionStorage.removeItem("mbala-session-active");
      window.dispatchEvent(new CustomEvent("mbala:auth-expired"));
    }
    return Promise.reject(error);
  }
);

export function getApiToken() {
  return localStorage.getItem(API_TOKEN_KEY);
}

export function setApiToken(token) {
  if (token) localStorage.setItem(API_TOKEN_KEY, token);
  else localStorage.removeItem(API_TOKEN_KEY);
}

export function clearApiToken() {
  localStorage.removeItem(API_TOKEN_KEY);
}
