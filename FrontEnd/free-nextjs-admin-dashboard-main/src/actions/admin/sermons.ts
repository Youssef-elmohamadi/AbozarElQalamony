"use server";

import { ApiError } from "@/api/Config";
import { getSermons, deleteSermon, createSermon, updateSermon } from "@/api/admin/sermons";
import { revalidatePath, revalidateTag } from "next/cache";

export async function getSermonsAction(
  page: number = 1,
  pageSize: number = 10,
  categoryId?: number | null,
  categoryName?: string | null,
  title?: string | null,
  search?: string | null
) {
  try {
    return await getSermons(page, pageSize, categoryId, categoryName, title, search);
    
  } catch (error: any) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) throw error;
    console.error("Error fetching sermons via action:", error);
    return null;
  }
}

export async function deleteSermonAction(id: number | string) {
  try {
    await deleteSermon(id);

    revalidateTag("sermons-list");
    revalidateTag("sermons");
    revalidateTag(`sermon-${id}`);
    revalidateTag("public-home");
    revalidateTag("search");
    revalidatePath("/");
    revalidatePath("/sermons");
    revalidatePath(`/sermons/${id}`);
    revalidatePath("/search");
    revalidatePath("/admin/sermons");


    return {
      success: true,
      message: "تم حذف الخطبة بنجاح",
      status: 200,
    };
  } catch (error: any) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) throw error;

    if (error instanceof ApiError) {
      return {
        success: false,
        message: error.message || "فشل حذف الخطبة",
        status: error.status,
      };
    }

    return {
      success: false,
      message: "حدث خطأ غير متوقع أثناء محاولة حذف الخطبة",
      status: 500,
    };
  }
}

export async function createSermonAction(formData: FormData) {
  try {
    const res = await createSermon(formData);
    revalidateTag("sermons-list");
    revalidateTag("sermons");
    revalidateTag("public-home");
    revalidateTag("search");
    revalidatePath("/");
    revalidatePath("/sermons");
    revalidatePath("/search");
    revalidatePath("/admin/sermons");


    return {
      success: true,
      message: "تم إضافة الخطبة بنجاح",
      data: res?.data,
      status: 201,
    };
  } catch (error: any) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) throw error;

    if (error instanceof ApiError) {
      return {
        success: false,
        message: error.message || "فشل إضافة الخطبة",
        errors: error.errors,
        status: error.status,
      };
    }

    return {
      success: false,
      message: "حدث خطأ غير متوقع أثناء إضافة الخطبة",
      errors: null,
      status: 500,
    };
  }
}

export async function updateSermonAction(id: number | string, formData: FormData) {
  try {
    const res = await updateSermon(id, formData);

    revalidateTag("sermons-list");
    revalidateTag("sermons");
    revalidateTag(`sermon-${id}`);
    revalidateTag("public-home");
    revalidateTag("search");
    revalidatePath("/");
    revalidatePath("/sermons");
    revalidatePath(`/sermons/${id}`);
    revalidatePath("/search");
    revalidatePath("/admin/sermons");
    revalidatePath(`/admin/sermons/${id}`);
    revalidatePath(`/admin/sermons/${id}/edit`);

    return {
      success: true,
      message: "تم حفظ تعديلات الخطبة بنجاح",
      data: res?.data,
      status: 200,
    };
  } catch (error: any) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) throw error;

    if (error instanceof ApiError) {
      return {
        success: false,
        message: error.message || "فشل تعديل الخطبة",
        errors: error.errors,
        status: error.status,
      };
    }

    return {
      success: false,
      message: "حدث خطأ غير متوقع أثناء تعديل الخطبة",
      errors: null,
      status: 500,
    };
  }
}

export async function revalidateSermonsCacheAction(sermonId?: number | string) {
  try {
    revalidateTag("sermons-list");
    revalidateTag("sermons");
    revalidatePath("/");
    revalidatePath("/sermons");
    revalidatePath("/admin/sermons");
    if (sermonId) {
      revalidateTag(`sermon-${sermonId}`);
      revalidateTag("sermons-list");
      revalidateTag("sermons");
      revalidateTag("public-home");
      revalidatePath("/");
      revalidatePath(`/admin/sermons/${sermonId}`);
      revalidatePath(`/admin/sermons/${sermonId}/edit`);
      revalidatePath(`/sermons/${sermonId}`);
    }
    return { success: true };
  } catch (err) {
    console.error("Cache revalidation error:", err);
    return { success: false };
  }
}
