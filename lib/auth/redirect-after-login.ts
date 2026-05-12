import type { AuthRole } from "@/lib/auth/constants";
import { parseAuthRoleFromLoginBody } from "@/lib/auth/role-from-response";

export function getPostLoginRedirect(
  body: unknown,
  fallbackTabRole: AuthRole,
): string {
  const role = parseAuthRoleFromLoginBody(body) ?? fallbackTabRole;
  if (role === "principal") return "/principal/dashboard";
  return "/dashboard";
}
