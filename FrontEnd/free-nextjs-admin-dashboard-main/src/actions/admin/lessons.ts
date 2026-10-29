"use server";

import { ApiError } from "@/api/Config";
import { getLessons, deleteLesson, createLesson, updateLesson } from "@/api/admin/lessons";
import { revalidatePath, revalidateTag } from "next/cache";

export async function getLessonsAction(
  page: number = 1,
  pageSize: number = 10,
  categoryId?: number | null,
  categoryName?: string | null,
  title?: string | null,
  search?: string | null
) {
  try {
    return await getLessons(page, pageSize, categoryId, categoryName, title, search);
  } catch (error: any) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) throw error;
    console.error("Error fetching lessons via action:", error);
    return null;
  }
}

export async function deleteLessonAction(id: number | string) {
  try {
    await deleteLesson(id);

    revalidateTag("lessons-list");
    revalidateTag("lessons");
    revalidateTag(`lesson-${id}`);
    revalidateTag("public-home");
    revalidateTag("search");
    revalidatePath("/");
    revalidatePath("/lessons");
    revalidatePath(`/lessons/${id}`);
    revalidatePath("/search");
    revalidatePath("/admin/lessons");

    return {
      success: true,
      message: "تم حذف الدرس بنجاح",
      status: 200,
    };
  } catch (error: any) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) throw error;

    if (error instanceof ApiError) {
      return {
        success: false,
        message: error.message || "فشل حذف الدرس",
        status: error.status,
      };
    }

    return {
      success: false,
      message: "حدث خطأ غير متوقع أثناء محاولة حذف الدرس",
      status: 500,
    };
  }
}

export async function createLessonAction(formData: FormData) {
  try {
    const res = await createLesson(formData);

    revalidateTag("lessons-list");
    revalidateTag("lessons");
    revalidateTag("public-home");
    revalidateTag("search");
    revalidatePath("/");
    revalidatePath("/lessons");
    revalidatePath("/search");
    revalidatePath("/admin/lessons");

    return {
      success: true,
      message: "تم إضافة الدرس بنجاح",
      data: res?.data,
      status: 201,
    };
  } catch (error: any) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) throw error;

    if (error instanceof ApiError) {
      return {
        success: false,
        message: error.message || "فشل إضافة الدرس",
        errors: error.errors,
        status: error.status,
      };
    }

    return {
      success: false,
      message: "حدث خطأ غير متوقع أثناء إضافة الدرس",
      errors: null,
      status: 500,
    };
  }
}

export async function updateLessonAction(id: number | string, formData: FormData) {
  try {
    const res = await updateLesson(id, formData);

    revalidateTag("lessons-list");
    revalidateTag("lessons");
    revalidateTag(`lesson-${id}`);
    revalidateTag("public-home");
    revalidateTag("search");
    revalidatePath("/");
    revalidatePath("/lessons");
    revalidatePath(`/lessons/${id}`);
    revalidatePath("/search");
    revalidatePath("/admin/lessons");
    revalidatePath(`/admin/lessons/${id}`);
    revalidatePath(`/admin/lessons/${id}/edit`);

    return {
      success: true,
      message: "تم حفظ تعديلات الدرس بنجاح",
      data: res?.data,
      status: 200,
    };
  } catch (error: any) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) throw error;

    if (error instanceof ApiError) {
      return {
        success: false,
        message: error.message || "فشل تعديل الدرس",
        errors: error.errors,
        status: error.status,
      };
    }

    return {
      success: false,
      message: "حدث خطأ غير متوقع أثناء تعديل الدرس",
      errors: null,
      status: 500,
    };
  }
}

export async function revalidateLessonsCacheAction(lessonId?: number | string) {
  try {
    revalidateTag("lessons-list");
    revalidateTag("lessons");
    revalidatePath("/");
    revalidatePath("/lessons");
    revalidatePath("/admin/lessons");
    if (lessonId) {
      revalidateTag(`lesson-${lessonId}`);
      revalidateTag("lessons-list");
      revalidateTag("lessons");
      revalidateTag("public-home");
      revalidatePath("/");
      revalidatePath(`/admin/lessons/${lessonId}`);
      revalidatePath(`/admin/lessons/${lessonId}/edit`);
      revalidatePath(`/lessons/${lessonId}`);
    }
    return { success: true };
  } catch (err) {
    console.error("Cache revalidation error:", err);
    return { success: false };
  }
}

