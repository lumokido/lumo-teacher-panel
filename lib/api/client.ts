function getPublicApiBaseUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ??
    "http://localhost:8080";
    // "https://java-production-a727.up.railway.app"
  return raw;
}

export type ApiResult<T> = {
  ok: boolean;
  status: number;
  data: T;
};

export async function apiPostJson<T>(
  path: string,
  body: unknown,
): Promise<ApiResult<T>> {
  const base = getPublicApiBaseUrl();
  const url = path.startsWith("http")
    ? path
    : `${base}/${path.replace(/^\//, "")}`;

  const controller = new AbortController();
  const timeoutMs = 15_000;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }

  const text = await res.text();
  let data: T = {} as T;
  if (text) {
    try {
      data = JSON.parse(text) as T;
    } catch {
      data = { message: text } as T;
    }
  }

  return { ok: res.ok, status: res.status, data };
}
