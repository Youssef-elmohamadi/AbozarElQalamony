import { apiFetch, ApiError } from "../Config";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://abuzarelqalamony.somee.com";

const isRedirect = (error: any) =>
  typeof error?.digest === "string" && error.digest.startsWith("NEXT_REDIRECT");

export const getCategories = async (
  page: number = 1,
  pageSize: number = 10,
  type?: number | null,
  name?: string | null
) => {
  try {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("pageSize", String(pageSize));
    if (type !== undefined && type !== null && type > 0) {
      params.set("type", String(type));
    }
    if (name && name.trim()) {
      params.set("name", name.trim());
      params.set("search", name.trim());
    }

    return await apiFetch(
      BASE_URL,
      `/api/Categories?${params.toString()}`,
      {
        next: {
          tags: ["categories"],
          revalidate: 3600 * 24,
        }
      },
      "admin_token"
    );
  } catch (error: any) {
    if (isRedirect(error)) throw error;

    console.error("Error fetching categories:", error);
    throw new Error(
      error instanceof ApiError ? error.message : "فشل تحميل التصنيفات"
    );
  }
};

export const getCategoryById = async (id: number | string) => {
  try {
    const res = await apiFetch(
      BASE_URL,
      `/api/Categories/${id}`,
      {
        next: {
          tags: [`category-${id}`],
        },
      },
      "admin_token"
    );
    return res?.data ?? null;
  } catch (error: any) {
    if (isRedirect(error)) throw error;
    if (error instanceof ApiError && error.status === 404) return null;
    console.error(`Error fetching category ${id}:`, error);
    throw error;
  }
};

export const getAllCategories = async (type?: number | null) => {
  try {
    const params = type && type > 0 ? `?type=${type}` : "";
    const res = await apiFetch(
      BASE_URL,
      `/api/Categories/all${params}`,
      {
        next: {
          tags: ["categories-all"],
        },
      },
      "admin_token"
    );
    return res?.data ?? [];
  } catch (error: any) {
    if (isRedirect(error)) throw error;
    console.error("Error fetching all categories:", error);
    return [];
  }
};

export const createCategory = async (data: {
  name: string;
  type: number;
  parentId?: number | null;
}) => {
  return await apiFetch(
    BASE_URL,
    `/api/Categories`,
    {
      method: "POST",
      body: JSON.stringify(data),
    },
    "admin_token"
  );
};

export const updateCategory = async (
  id: number | string,
  data: {
    name: string;
    type?: number | null;
    parentId?: number | null;
  }
) => {
  return await apiFetch(
    BASE_URL,
    `/api/Categories/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    },
    "admin_token"
  );
};

export const deleteCategory = async (id: number | string) => {
  return await apiFetch(
    BASE_URL,
    `/api/Categories/${id}`,
    {
      method: "DELETE",
    },
    "admin_token"
  );
};
