export const webOrigin = process.env.NEXT_PUBLIC_WEB_URL ?? "http://localhost:3000";

const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
const TOKEN = "furniture-admin-token";
const USER = "furniture-admin-user";

export type AdminUser = { name: string; email: string };

export function token() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN);
}

export function currentUser(): AdminUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AdminUser;
  } catch {
    return null;
  }
}

export function setSession(accessToken: string, admin: AdminUser) {
  localStorage.setItem(TOKEN, accessToken);
  localStorage.setItem(USER, JSON.stringify(admin));
}

export function clearSession() {
  localStorage.removeItem(TOKEN);
  localStorage.removeItem(USER);
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  const access = token();
  if (access) headers.set("Authorization", `Bearer ${access}`);
  if (init?.body && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const response = await fetch(`${base}${path}`, { ...init, headers });
  if (response.status === 401 && !path.includes("/auth/login")) {
    clearSession();
    if (typeof window !== "undefined") window.location.href = "/login";
  }
  if (!response.ok) {
    let message = response.statusText || "Request failed.";
    try {
      const body = (await response.json()) as { message?: string | string[] };
      if (Array.isArray(body.message)) message = body.message.join(" ");
      else if (body.message) message = body.message;
    } catch {
      // ignore
    }
    throw new Error(message);
  }
  return response.json() as Promise<T>;
}

export function send<T>(path: string, body: unknown, method = "POST") {
  return api<T>(path, { method, body: JSON.stringify(body) });
}

export async function uploadImage(file: File) {
  const body = new FormData();
  body.append("file", file);
  const result = await api<{ url: string }>("/admin/uploads", { method: "POST", body });
  return result.url;
}

export function media(src: string) {
  if (!src) return "";
  if (src.startsWith("http")) return src;
  return `${webOrigin}${src}`;
}

export const money = (value: number) => `BDT ${value.toLocaleString("en-US")}`;

export function when(iso: string) {
  return new Date(iso).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });
}

export const statusLabel: Record<string, string> = {
  received: "Received",
  confirmed: "Confirmed",
  processing: "Processing",
  delivered: "Delivered",
  cancelled: "Cancelled",
};
