"use server";

import { ApiError } from "@/api/Config";
import {
  getCategories,
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/api/admin/categories";
import { revalidatePath, revalidateTag } from "next/cache";

export async function getCategoriesAction(
  page: number = 1,
  pageSize: number = 10,
  type?: number | null,
  name?: string | null
) {
  try {
    return await getCategories(page, pageSize, type, name);
  } catch (error: any) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) throw error;
    console.error("Error fetching categories via action:", error);
    return null;
  }
}

export async function getAllCategoriesAction(type?: number | null) {
  try {
    return await getAllCategories(type);
  } catch (error: any) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) throw error;
    console.error("Error fetching all categories via action:", error);
    return [];
  }
}

export async function createCategoryAction(data: {
  name: string;
  type: number;
  parentId?: number | null;
}) {
  try {
    const res = await createCategory(data);

    revalidateTag("categories-list");
    revalidateTag("categories-all");
    revalidatePath("/admin/categories");

    return {
      success: true,
      message: "تم إنشاء التصنيف بنجاح",
      data: res?.data,
      status: 201,
    };
  } catch (error: any) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) throw error;

    if (error instanceof ApiError) {
      return {
        success: false,
        message: error.message,
        errors: error.errors,
        status: error.status,
      };
    }

    return {
      success: false,
      message: "فشل إنشاء التصنيف. يرجى المحاولة مرة أخرى.",
      errors: null,
      status: 500,
    };
  }
}

export async function updateCategoryAction(
  id: number,
  data: {
    name: string;
    type?: number | null;
    parentId?: number | null;
  }
) {
  try {
    const res = await updateCategory(id, data);

    revalidateTag("categories-list");
    revalidateTag(`category-${id}`);
    revalidateTag("categories-all");
    revalidatePath("/admin/categories");
    revalidatePath(`/admin/categories/${id}/edit`);

    return {
      success: true,
      message: "تم تحديث التصنيف بنجاح",
      data: res?.data,
      status: 200,
    };
  } catch (error: any) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) throw error;

    if (error instanceof ApiError) {
      return {
        success: false,
        message: error.message,
        errors: error.errors,
        status: error.status,
      };
    }

    return {
      success: false,
      message: "فشل تحديث التصنيف. يرجى المحاولة مرة أخرى.",
      errors: null,
      status: 500,
    };
  }
}

export async function deleteCategoryAction(id: number) {
  try {
    await deleteCategory(id);
  } catch (error: any) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) throw error;

    if (error instanceof ApiError) {
      let userFriendlyMessage = error.message;
      if (error.status === 409) {
        userFriendlyMessage =
          "لا يمكن حذف هذا التصنيف لوجود عناصر أو تصنيفات فرعية مرتبطة به.";
      }

      return {
        success: false,
        message: userFriendlyMessage,
        errors: error.errors,
        status: error.status,
      };
    }

    return {
      success: false,
      message: "فشل حذف التصنيف. يرجى المحاولة مرة أخرى.",
      errors: null,
      status: 500,
    };
  }

  revalidateTag("categories-list");
  revalidateTag(`category-${id}`);
  revalidateTag("categories-all");
  revalidatePath("/admin/categories");

  return {
    success: true,
    message: "تم حذف التصنيف بنجاح",
    errors: null,
    status: 200,
  };
}
