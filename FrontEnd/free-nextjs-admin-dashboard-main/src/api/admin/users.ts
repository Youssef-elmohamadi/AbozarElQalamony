import { apiFetch, ApiError } from "../Config";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7281";

const isRedirect = (error: any) =>
  typeof error?.digest === "string" && error.digest.startsWith("NEXT_REDIRECT");

export const getUsers = async (
  page: number = 1,
  pageSize: number = 10,
  roleId?: number | null,
  name?: string | null
) => {
  try {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("pageSize", String(pageSize));
    if (roleId && roleId > 0) {
      params.set("roleId", String(roleId));
    }
    if (name && name.trim()) {
      params.set("name", name.trim());
      params.set("search", name.trim());
    }

    return await apiFetch(
      BASE_URL,
      `/api/admin/users?${params.toString()}`,
      {
        next: {
          tags: ["users"],
          revalidate: 3600 * 24,
        },
      },
      "admin_token"
    );
  } catch (error: any) {
    if (isRedirect(error)) throw error;

    console.error("Error fetching users:", error);
    throw new Error(
      error instanceof ApiError ? error.message : "Failed to load users"
    );
  }
};

export async function getUserForEdit(id: string | number) {
  try {
    const res = await apiFetch(
      BASE_URL,
      `/api/admin/users/${id}`,
      {
        next: {
          tags: [`user-edit-${id}`],
        },
      },
      "admin_token"
    );
    return res?.data ?? null;
  } catch (error: any) {
    if (isRedirect(error)) throw error;

    if (error instanceof ApiError && error.status === 404) return null;

    console.error("Error fetching user:", error);
    throw error;
  }
}

export async function getProfile() {
  try {
    const res = await apiFetch(
      BASE_URL,
      `/api/admin/Users/profile`,
      {
        next: {
          tags: ["user-profile"],
          revalidate: 3600 * 24,
        },
      },
      "admin_token"
    );
    return res?.data ?? res ?? null;
  } catch (error: any) {
    if (isRedirect(error)) throw error;
    console.error("Error fetching user profile:", error);
    throw error;
  }
}

export async function updateProfile(data: FormData) {
  try {
    const res = await apiFetch(
      BASE_URL,
      `/api/admin/Users/profile`,
      {
        method: "PUT",
        body: data,
      },
      "admin_token"
    );
    return res?.data ?? res ?? null;
  } catch (error: any) {
    if (isRedirect(error)) throw error;
    console.error("Error updating user profile:", error);
    throw error;
  }
}
