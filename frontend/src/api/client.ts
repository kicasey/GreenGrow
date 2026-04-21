// Thin fetch wrapper so pages don't duplicate error handling.
// In dev, Vite proxies /api -> http://localhost:5080 (see vite.config.ts).
// In prod you can set VITE_API_BASE to your Heroku backend URL.

const BASE = import.meta.env.VITE_API_BASE ?? "";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status} ${res.statusText}: ${text}`);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const api = {
  get:  <T>(p: string) => request<T>(p),
  post: <T>(p: string, body: unknown) =>
    request<T>(p, { method: "POST", body: JSON.stringify(body) }),
  put:  <T>(p: string, body: unknown) =>
    request<T>(p, { method: "PUT",  body: JSON.stringify(body) }),
  del:  <T>(p: string) => request<T>(p, { method: "DELETE" }),
};
