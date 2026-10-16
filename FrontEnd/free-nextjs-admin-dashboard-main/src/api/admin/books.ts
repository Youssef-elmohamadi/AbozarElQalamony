import { apiFetch, ApiError } from "../Config";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7281";

const isRedirect = (error: any) =>
  typeof error?.digest === "string" && error.digest.startsWith("NEXT_REDIRECT");

export interface BookItem {
  id: number;
  title: string;
  authorName: string;
  description?: string | null;
  pdfFilePath?: string | null;
  coverImagePath?: string | null;
  publishDate?: string | null;
  createdAt: string;
  categoryId: number;
  categoryName: string;
}

export const getBooks = async (
  page: number = 1,
  pageSize: number = 10,
  categoryId?: number | null,
  categoryName?: string | null,
  title?: string | null,
  search?: string | null,
  authorName?: string | null
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
    if (authorName && authorName.trim()) {
      params.set("authorName", authorName.trim());
    }
    if (search && search.trim()) {
      params.set("search", search.trim());
    }

    return await apiFetch(
      BASE_URL,
      `/api/books?${params.toString()}`,
      {
        cache: "no-store",
      },
      "admin_token"
    );
  } catch (error: any) {
    if (isRedirect(error)) throw error;

    console.error("Error fetching books:", error);
    throw new Error(
      error instanceof ApiError ? error.message : "فشل تحميل قائمة الكتب"
    );
  }
};

export const getBookById = async (id: number | string) => {
  try {
    const res = await apiFetch(
      BASE_URL,
      `/api/books/${id}`,
      {
        cache: "no-store",
      },
      "admin_token"
    );
    return res?.data ?? null;
  } catch (error: any) {
    if (isRedirect(error)) throw error;
    if (error instanceof ApiError && error.status === 404) return null;
    console.error(`Error fetching book ${id}:`, error);
    throw error;
  }
};

export const deleteBook = async (id: number | string) => {
  return await apiFetch(
    BASE_URL,
    `/api/admin/books/${id}`,
    {
      method: "DELETE",
    },
    "admin_token"
  );
};

export const createBook = async (formData: FormData) => {
  return await apiFetch(
    BASE_URL,
    `/api/admin/books`,
    {
      method: "POST",
      body: formData,
    },
    "admin_token"
  );
};

export const updateBook = async (id: number | string, formData: FormData) => {
  return await apiFetch(
    BASE_URL,
    `/api/admin/books/${id}`,
    {
      method: "PUT",
      body: formData,
    },
    "admin_token"
  );
};
