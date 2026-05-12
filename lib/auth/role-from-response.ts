import type { AuthRole } from "@/lib/auth/constants";

/** Backend login JSON often includes `type: "principal" | "teacher"`. */
export function parseAuthRoleFromLoginBody(data: unknown): AuthRole | null {
  if (!data || typeof data !== "object") return null;
  const t = (data as Record<string, unknown>).type;
  if (t === "principal" || t === "teacher") return t;
  return null;
}
