import { apiFetch } from "@/api/Config";

export async function login(email: string, password: string) {
  return await apiFetch(
    (process.env.NEXT_PUBLIC_API_URL || "https://localhost:7281"),
    "/api/login",
    {
      method: "POST",
      body: JSON.stringify({ email, password }),
    },
    "admin_token"
  );
}

export async function logout() {
  return await apiFetch(
    (process.env.NEXT_PUBLIC_API_URL || "https://localhost:7281"),
    "/api/logout",
    {
      method: "POST",
    },
    "admin_token"
  );
}