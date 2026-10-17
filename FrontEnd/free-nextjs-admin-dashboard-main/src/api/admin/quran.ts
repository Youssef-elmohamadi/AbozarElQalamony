import { apiFetch, ApiError } from "../Config";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7281";

const isRedirect = (error: any) =>
  typeof error?.digest === "string" && error.digest.startsWith("NEXT_REDIRECT");

export interface QuranItem {
  id: number;
  title: string;
  description?: string | null;
  audioFilePath?: string | null;
  videoFilePath?: string | null;
  thumbnailPath?: string | null;
  durationInMinutes?: number | null;
  surahNumber?: number | null;
  surahName?: string | null;
  publishDate?: string | null;
  createdAt: string;
  categoryId: number;
  categoryName: string;
}

export const getQurans = async (
  page: number = 1,
  pageSize: number = 10,
  categoryId?: number | null,
  categoryName?: string | null,
  title?: string | null,
  search?: string | null,
  sort: string = "latest"
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
    if (sort && sort.trim()) {
      params.set("sort", sort.trim());
    }

    return await apiFetch(
      BASE_URL,
      `/api/admin/quran?${params.toString()}`,
      {
        cache: "no-store",
      },
      "admin_token"
    );
  } catch (error: any) {
    if (isRedirect(error)) throw error;

    console.error("Error fetching quran items:", error);
    throw new Error(
      error instanceof ApiError ? error.message : "فشل تحميل قائمة تسجيلات وتلاوات القرآن الكريم"
    );
  }
};

export const getQuranById = async (id: number | string) => {
  try {
    const res = await apiFetch(
      BASE_URL,
      `/api/admin/quran/${id}`,
      {
        cache: "no-store",
      },
      "admin_token"
    );
    return res?.data ?? null;
  } catch (error: any) {
    if (isRedirect(error)) throw error;
    if (error instanceof ApiError && error.status === 404) return null;
    console.error(`Error fetching quran item ${id}:`, error);
    throw error;
  }
};

export const deleteQuran = async (id: number | string) => {
  return await apiFetch(
    BASE_URL,
    `/api/admin/quran/${id}`,
    {
      method: "DELETE",
    },
    "admin_token"
  );
};

export const createQuran = async (formData: FormData) => {
  return await apiFetch(
    BASE_URL,
    `/api/admin/quran`,
    {
      method: "POST",
      body: formData,
    },
    "admin_token"
  );
};

export const updateQuran = async (id: number | string, formData: FormData) => {
  return await apiFetch(
    BASE_URL,
    `/api/admin/quran/${id}`,
    {
      method: "PUT",
      body: formData,
    },
    "admin_token"
  );
};
