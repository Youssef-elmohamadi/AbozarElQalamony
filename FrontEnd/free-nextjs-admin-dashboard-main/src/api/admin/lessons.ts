import { apiFetch, ApiError } from "../Config";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7281";

const isRedirect = (error: any) =>
  typeof error?.digest === "string" && error.digest.startsWith("NEXT_REDIRECT");

export interface LessonItem {
  id: number;
  title: string;
  description?: string | null;
  audioFilePath?: string | null;
  videoFilePath?: string | null;
  thumbnailPath?: string | null;
  durationInMinutes?: number | null;
  publishDate?: string | null;
  createdAt: string;
  categoryId: number;
  categoryName: string;
}

export const getLessons = async (
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
      `/api/lessons?${params.toString()}`,
      {
        next: {
          revalidate: 86400,
          tags: ["lessons", "lessons-list"],
        },
      },
      "admin_token"
    );
  } catch (error: any) {
    if (isRedirect(error)) throw error;

    console.error("Error fetching lessons:", error);
    throw new Error(
      error instanceof ApiError ? error.message : "فشل تحميل قائمة الدروس"
    );
  }
};

export const getLessonById = async (id: number | string) => {
  try {
    const res = await apiFetch(
      BASE_URL,
      `/api/lessons/${id}`,
      {
        next: {
          revalidate: 86400,
          tags: ["lessons", "lessons-list", `lesson-${id}`],
        },
      },
      "admin_token"
    );
    return res?.data ?? null;
  } catch (error: any) {
    if (isRedirect(error)) throw error;
    if (error instanceof ApiError && error.status === 404) return null;
    console.error(`Error fetching lesson ${id}:`, error);
    throw error;
  }
};

export const deleteLesson = async (id: number | string) => {
  return await apiFetch(
    BASE_URL,
    `/api/admin/lessons/${id}`,
    {
      method: "DELETE",
    },
    "admin_token"
  );
};

export const createLesson = async (formData: FormData) => {
  return await apiFetch(
    BASE_URL,
    `/api/admin/lessons`,
    {
      method: "POST",
      body: formData,
    },
    "admin_token"
  );
};

export const updateLesson = async (id: number | string, formData: FormData) => {
  return await apiFetch(
    BASE_URL,
    `/api/admin/lessons/${id}`,
    {
      method: "PUT",
      body: formData,
    },
    "admin_token"
  );
};

