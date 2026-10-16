import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export class ApiError extends Error {
  status: number;
  errors: Record<string, string[]> | null;
  data: any;

  constructor(
    message: string,
    status: number,
    errors: Record<string, string[]> | null = null,
    data: any = null
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
    this.data = data;
  }
}

export async function apiFetch(
  baseUrl: string,
  endpoint: string,
  options: RequestInit = {},
  tokenKey: string = "admin_token"
) {
  let token = "";
  let cookieStore: any = null;

  if (typeof window === "undefined") {
    cookieStore = await cookies();
    token = cookieStore.get(tokenKey)?.value || "";
  } else {
    token = localStorage.getItem(tokenKey) || "";
    if (!token && typeof document !== "undefined") {
      const match = document.cookie.match(new RegExp(`(?:^|; )${tokenKey}=([^;]*)`));
      token = match ? decodeURIComponent(match[1]) : "";
    }
  }

  const headers: HeadersInit = {
    Accept: "application/json",
    ...(!(options.body instanceof FormData) && {
      "Content-Type": "application/json",
    }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  let res: Response;
  try {
    res = await fetch(`${baseUrl}${endpoint}`, {
      ...options,
      headers,
    });
  } catch {
    throw new ApiError("تعذر الاتصال بالسيرفر", 0);
  }

  const isLogin = endpoint.toLowerCase().includes("/login");

  if ((res.status === 401 || res.status === 419) && !isLogin) {
    if (typeof window === "undefined") {
      try {
        cookieStore?.delete(tokenKey);
      } catch {}
      redirect("/admin/login");
    } else {
      localStorage.removeItem(tokenKey);
      document.cookie = `${tokenKey}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      window.location.href = "/admin/login";
      throw new ApiError("انتهت الجلسة", res.status);
    }
  }

  const text = await res.text();
  let json: any = null;

  if (text) {
    try {
      json = JSON.parse(text);
    } catch {
      json = null;
    }
  }

  if (!res.ok) {
    throw new ApiError(
      json?.message || json?.title || json?.detail || `API Error: ${res.status}`,
      res.status,
      json?.errors ?? null,
      json?.data ?? null
    );
  }

  if (res.status === 204 || !text) return null;

  if (json === null) {
    throw new ApiError("رد غير متوقع من السيرفر", res.status);
  }

  return json;
}