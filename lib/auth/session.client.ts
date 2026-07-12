import {
  AUTH_COOKIE,
  Alphores_TOKEN_KEY,
  REFRESH_TOKEN_COOKIE,
  ROLE_COOKIE,
  type AuthRole,
} from "@/lib/auth/constants";
import { parseAuthRoleFromLoginBody } from "@/lib/auth/role-from-response";
import { extractTokenFromBody } from "@/lib/auth/token";

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

function setBrowserCookie(name: string, value: string) {
  if (typeof document === "undefined") return;

  // Only mark cookies as Secure on real HTTPS pages.
  // On http://localhost cookies would be ignored if Secure is set.
  const isHttps =
    typeof window !== "undefined" && window.location.protocol === "https:";
  const secure = isHttps ? "; Secure" : "";

  const encoded = encodeURIComponent(value);
  document.cookie = `${name}=${encoded}; path=/; max-age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax${secure}`;
}

function clearBrowserCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; path=/; max-age=0`;
}

/**
 * Persist session for the Next.js middleware guard.
 * Uses API `type` when present; otherwise falls back to the tab role used to log in.
 * Returns false if no token exists in the backend response.
 */
export function persistAuthSession(
  body: unknown,
  fallbackRole: AuthRole,
): boolean {
  const token = extractTokenFromBody(body);
  const refreshToken = extractTokenFromBody(body) || "";
  if (!token) {
    clearAuthSession();
    return false;
  }

  const role = parseAuthRoleFromLoginBody(body) ?? fallbackRole;

  setBrowserCookie(AUTH_COOKIE, token);
  setBrowserCookie(REFRESH_TOKEN_COOKIE, refreshToken || "");
  setBrowserCookie(ROLE_COOKIE, role);

  try {
    localStorage.setItem(Alphores_TOKEN_KEY, token);
    sessionStorage.setItem("accessToken", token);
    localStorage.setItem("refreshToken", refreshToken || "");
    sessionStorage.setItem("type", role);
    sessionStorage.setItem("refreshToken", refreshToken || "");
  } catch {
    /* ignore storage errors */
  }

  return true;
}

export function clearAuthSession() {
  clearBrowserCookie(AUTH_COOKIE);
  clearBrowserCookie(ROLE_COOKIE);

  try {
    localStorage.removeItem(Alphores_TOKEN_KEY);
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("type");
  } catch {
    /* ignore */
  }
}

