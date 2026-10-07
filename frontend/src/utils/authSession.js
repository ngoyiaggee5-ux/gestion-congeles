import { AUTH_STORAGE_KEY, SESSION_ACTIVE_KEY } from "./authConstants";

const JWT_SECRET = "mbala-kwa-jwt-secret-v1";
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;

function base64UrlEncode(value) {
  const str = typeof value === "string" ? value : JSON.stringify(value);
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(value) {
  let normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  while (normalized.length % 4) normalized += "=";
  return atob(normalized);
}

async function sign(data) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(JWT_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(data)
  );
  return base64UrlEncode(String.fromCharCode(...new Uint8Array(signature)));
}

export async function createSessionToken(user) {
  const header = base64UrlEncode({ alg: "HS256", typ: "JWT" });
  const payload = {
    sub: user.id,
    role: user.role,
    email: user.email,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor((Date.now() + SESSION_TTL_MS) / 1000),
  };
  const payloadPart = base64UrlEncode(payload);
  const signature = await sign(`${header}.${payloadPart}`);
  return {
    token: `${header}.${payloadPart}.${signature}`,
    expiresAt: new Date(Date.now() + SESSION_TTL_MS).toISOString(),
  };
}

export async function parseSessionToken(token) {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [header, payloadPart, signature] = parts;
  const expected = await sign(`${header}.${payloadPart}`);
  if (expected !== signature) return null;

  const payload = JSON.parse(base64UrlDecode(payloadPart));
  if (!payload?.sub || payload.exp * 1000 < Date.now()) return null;

  return {
    userId: payload.sub,
    role: payload.role,
    email: payload.email,
    expiresAt: new Date(payload.exp * 1000).toISOString(),
  };
}

export function readStoredSession() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function getValidAuthSession() {
  const stored = readStoredSession();
  if (!stored?.token) return null;

  const parsed = await parseSessionToken(stored.token);
  if (!parsed) {
    clearAuthSession();
    return null;
  }

  return { ...stored, ...parsed };
}

export async function saveAuthSession(user) {
  const { token, expiresAt } = await createSessionToken(user);
  const session = { userId: user.id, token, expiresAt };
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  return session;
}

export function clearAuthSession() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function getSessionExpiresAt() {
  const stored = readStoredSession();
  return stored?.expiresAt || null;
}

export function isBrowserSessionActive() {
  return sessionStorage.getItem(SESSION_ACTIVE_KEY) === "1";
}

export function markBrowserSessionActive() {
  sessionStorage.setItem(SESSION_ACTIVE_KEY, "1");
}

export function clearBrowserSessionActive() {
  sessionStorage.removeItem(SESSION_ACTIVE_KEY);
}
