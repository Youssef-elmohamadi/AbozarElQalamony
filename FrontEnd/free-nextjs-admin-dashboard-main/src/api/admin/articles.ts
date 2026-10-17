import { apiFetch, ApiError } from "../Config";
import { ArticleItem, CreateArticleInput, UpdateArticleInput } from "@/types/article";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7281";

const isRedirect = (error: any) =>
  typeof error?.digest === "string" && error.digest.startsWith("NEXT_REDIRECT");

export const getArticles = async (
  page: number = 1,
  pageSize: number = 10,
  search?: string | null
) => {
  try {
    const params = new URLSearchParams();
    params.set("Page", String(page));
    params.set("PageSize", String(pageSize));
    if (search && search.trim()) {
      params.set("search", search.trim());
      params.set("title", search.trim());
    }

    return await apiFetch(
      BASE_URL,
      `/api/Articles?${params.toString()}`,
      {
        next: {
          tags: ["articles-list"],
          revalidate: 43200,
        }
      },
      "admin_token"
    );
  } catch (error: any) {
    if (isRedirect(error)) throw error;
    console.error("Error fetching articles:", error);
    throw new Error(
      error instanceof ApiError ? error.message : "فشل تحميل المقالات"
    );
  }
};

export const getArticleById = async (id: number | string) => {
  try {
    const res = await apiFetch(
      BASE_URL,
      `/api/Articles/${id}`,
      {
        next: {
          tags: [`article-${id}`],
          revalidate: 43200,
        },
      },
      "admin_token"
    );
    return res?.data ?? null;
  } catch (error: any) {
    if (isRedirect(error)) throw error;
    if (error instanceof ApiError && error.status === 404) return null;
    console.error(`Error fetching article ${id}:`, error);
    throw error;
  }
};

export const createArticle = async (data: CreateArticleInput) => {
  return await apiFetch(
    BASE_URL,
    `/api/admin/articles`,
    {
      method: "POST",
      body: JSON.stringify(data),
    },
    "admin_token"
  );
};

export const updateArticle = async (
  id: number | string,
  data: UpdateArticleInput
) => {
  return await apiFetch(
    BASE_URL,
    `/api/admin/articles/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    },
    "admin_token"
  );
};

export const deleteArticle = async (id: number | string) => {
  return await apiFetch(
    BASE_URL,
    `/api/admin/articles/${id}`,
    {
      method: "DELETE",
    },
    "admin_token"
  );
};
