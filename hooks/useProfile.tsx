
import { api } from "@/lib/api/httpClient";
import { useCallback, useState } from "react";

function messageFromUnknownError(data: unknown): string {
  if (!data || typeof data !== "object") return "Sign in failed";
  const o = data as Record<string, unknown>;
  if (typeof o.message === "string") return o.message;
  if (typeof o.error === "string") return o.error;
  return "Sign in failed";
}

export function useProfile() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
    const [profile, setProfile] = useState<any>(null);

  const getProfile = useCallback(
    async () => {
      setLoading(true);
      setError(null);
      try {
       const result = await api.get('/api/admin/profile');

        if (result.status !== 200) {
          setError(messageFromUnknownError(result.data));
          return false;
        }
    
        setProfile(result.data);
        return true;
      } catch {
        setError(
          "Network error. Check CORS on the API and that NEXT_PUBLIC_API_BASE_URL is correct.",
        );
        return false;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return { getProfile, loading, error, profile };
}
