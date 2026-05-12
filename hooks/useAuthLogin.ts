"use client";

import { useCallback, useState } from "react";
import {
  postPrincipalLogin,
  postTeacherLogin,
  type LoginCredentials,
} from "@/lib/api/auth";
import type { AuthRole } from "@/lib/auth/constants";
import { getPostLoginRedirect } from "@/lib/auth/redirect-after-login";
import { parseAuthRoleFromLoginBody } from "@/lib/auth/role-from-response";
import { persistAuthSession } from "@/lib/auth/session.client";

function messageFromUnknownError(data: unknown): string {
  if (!data || typeof data !== "object") return "Sign in failed";
  const o = data as Record<string, unknown>;
  if (typeof o.message === "string") return o.message;
  if (typeof o.error === "string") return o.error;
  return "Sign in failed";
}

export type AuthLoginResult =
  | { ok: true; redirectTo: string; role: AuthRole }
  | { ok: false };

const teacherPaths = [
  "/dashboard",
  "/classes",
  "/students",
  "/assignments",
  "/settings",
];

function isTeacherPath(path: string) {
  return teacherPaths.some(
    (p) => path === p || path.startsWith(`${p}/`),
  );
}

/** Safe deep-link after login: must match resolved role. */
export function pickPostLoginPath(
  from: string | null,
  role: AuthRole,
  fallback: string,
): string {
  if (!from || !from.startsWith("/")) return fallback;
  if (role === "principal") {
    if (from.startsWith("/principal")) return from;
    return fallback;
  }
  if (isTeacherPath(from) && !from.startsWith("/principal")) return from;
  return fallback;
}

export function useAuthLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(
    async (
      tabRole: AuthRole,
      credentials: LoginCredentials,
    ): Promise<AuthLoginResult> => {
      setLoading(true);
      setError(null);
      try {
        const result =
          tabRole === "principal"
            ? await postPrincipalLogin(credentials)
            : await postTeacherLogin(credentials);

        if (!result.ok) {
          setError(messageFromUnknownError(result.data));
          return { ok: false };
        }

        const sessionOk = persistAuthSession(result.data, tabRole);
        if (!sessionOk) {
          setError("Login succeeded but token was not found in response.");
          return { ok: false };
        }

        const resolvedRole =
          parseAuthRoleFromLoginBody(result.data) ?? tabRole;
        const redirectTo = getPostLoginRedirect(result.data, tabRole);
        return { ok: true, redirectTo, role: resolvedRole };
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        return { ok: false };
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return { login, loading, error, setError };
}
