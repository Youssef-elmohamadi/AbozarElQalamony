import { apiFetch, ApiError } from "../Config";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7281";

const isRedirect = (error: any) =>
  typeof error?.digest === "string" && error.digest.startsWith("NEXT_REDIRECT");

export interface SermonItem {
  id: number;
  title: string;
  description?: string | null;
  khutbahDate: string;
  audioFilePath?: string | null;
  videoFilePath?: string | null;
  publishDate?: string | null;
  createdAt: string;
  categoryId: number;
  categoryName: string;
}

export const getSermons = async (
  page: number = 1,
  pageSize: number = 10,
  categoryId?: number | null,
  categoryName?: string | null,
  title?: string | null,
  search?: string | null
) => {
  try {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("pageSize", String(pageSize));

    if (categoryId !== undefined && categoryId !== null && categoryId > 0) {
      params.set("categoryId", String(categoryId));
    }
    if (categoryName && categoryName.trim()) {
      params.set("categoryName", categoryName.trim());
    }
    if (title && title.trim()) {
      params.set("title", title.trim());
      params.set("name", title.trim());
    }
    if (search && search.trim()) {
      params.set("search", search.trim());
    }

    return await apiFetch(
      BASE_URL,
      `/api/sermons?${params.toString()}`,
      {
        next: {
          tags: ["sermons-list", `sermons-list-${categoryId}`],

          revalidate: 3600 * 24,
        },
      },
      "admin_token"
    );
  } catch (error: any) {
    if (isRedirect(error)) throw error;

    console.error("Error fetching sermons:", error);
    throw new Error(
      error instanceof ApiError ? error.message : "فشل تحميل قائمة الخطب"
    );
  }
};

export const getSermonById = async (id: number | string) => {
  try {
    const res = await apiFetch(
      BASE_URL,
      `/api/sermons/${id}`,
      {
        next: {
          tags: ["sermon", `sermon-${id}`, "sermons-list"],
          revalidate: 3600 * 24,
        },
      },
      "admin_token"
    );
    return res?.data ?? null;
  } catch (error: any) {
    if (isRedirect(error)) throw error;
    if (error instanceof ApiError && error.status === 404) return null;
    console.error(`Error fetching sermon ${id}:`, error);
    throw error;
  }
};

export const deleteSermon = async (id: number | string) => {
  return await apiFetch(
    BASE_URL,
    `/api/admin/sermons/${id}`,
    {
      method: "DELETE",
    },

    "admin_token"
  );
};

export const createSermon = async (formData: FormData) => {
  return await apiFetch(
    BASE_URL,
    `/api/admin/sermons`,
    {
      method: "POST",
      body: formData,
    },
    "admin_token"
  );
};

export const updateSermon = async (id: number | string, formData: FormData) => {
  return await apiFetch(
    BASE_URL,
    `/api/admin/sermons/${id}`,
    {
      method: "PUT",
      body: formData,
    },
    "admin_token"
  );
};
