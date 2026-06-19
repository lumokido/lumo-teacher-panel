export function extractTokenFromBody(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const o = data as Record<string, unknown>;
  const keys = [
    "accessToken",
    "token",
    "jwt",
    "access_token",
    "idToken",
    "bearerToken",
    "refreshToken",
  ] as const;
  for (const k of keys) {
    const v = o[k];
    if (typeof v === "string" && v.length > 0) return v;
  }
  return null;
}
