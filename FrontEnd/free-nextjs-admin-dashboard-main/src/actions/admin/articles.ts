"use server";

import { ApiError } from "@/api/Config";
import {
  getArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
} from "@/api/admin/articles";
import { CreateArticleInput, UpdateArticleInput } from "@/types/article";
import { revalidatePath, revalidateTag } from "next/cache";

export async function getArticlesAction(
  page: number = 1,
  pageSize: number = 10,
  search?: string | null
) {
  try {
    return await getArticles(page, pageSize, search);
  } catch (error: any) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) throw error;
    console.error("Error fetching articles via action:", error);
    return null;
  }
}

export async function deleteArticleAction(id: number | string) {
  try {
    await deleteArticle(id);

    revalidateTag("articles-list");
    revalidateTag(`article-${id}`);
    revalidateTag("public-home");
    revalidatePath("/");
    revalidatePath("/admin/articles");
    revalidatePath("/articles");
    revalidatePath(`/articles/${id}`);
    revalidatePath("/search");


    return {
      success: true,
      message: "تم حذف المقال بنجاح",
      status: 200,
    };
  } catch (error: any) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) throw error;

    if (error instanceof ApiError) {
      return {
        success: false,
        message: error.message || "فشل حذف المقال",
        status: error.status,
      };
    }

    return {
      success: false,
      message: "حدث خطأ غير متوقع أثناء محاولة حذف المقال",
      status: 500,
    };
  }
}

export async function createArticleAction(data: CreateArticleInput) {
  try {
    const res = await createArticle(data);

    revalidateTag("articles-list");
    revalidateTag("public-home");
    revalidatePath("/");
    revalidatePath("/admin/articles");
    revalidatePath("/articles");
    revalidatePath("/search");

    return {
      success: true,
      data: res?.data ?? res,
      message: "تم إنشاء المقال بنجاح",
      errors: null,
      status: 201,
    };
  } catch (error: any) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) throw error;

    if (error instanceof ApiError) {
      return {
        success: false,
        data: null,
        message: error.message,
        errors: error.errors,
        status: error.status,
      };
    }

    return {
      success: false,
      data: null,
      message: "فشل إنشاء المقال",
      errors: null,
      status: 500,
    };
  }
}

export async function updateArticleAction(
  id: number | string,
  data: UpdateArticleInput
) {
  try {
    const res = await updateArticle(id, data);

    revalidateTag("articles-list");
    revalidateTag(`article-${id}`);
    revalidateTag("public-home");
    revalidatePath("/");
    revalidatePath("/admin/articles");
    revalidatePath("/articles");
    revalidatePath(`/articles/${id}`);
    revalidatePath("/search");

    return {
      success: true,
      data: res?.data ?? res,
      message: "تم حفظ تعديلات المقال بنجاح",
      errors: null,
      status: 200,
    };
  } catch (error: any) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) throw error;

    if (error instanceof ApiError) {
      return {
        success: false,
        data: null,
        message: error.message,
        errors: error.errors,
        status: error.status,
      };
    }

    return {
      success: false,
      data: null,
      message: "فشل تعديل المقال",
      errors: null,
      status: 500,
    };
  }
}
