"use server";

import { ApiError } from "@/api/Config";
import { getQurans, deleteQuran, createQuran, updateQuran } from "@/api/admin/quran";
import { revalidatePath, revalidateTag } from "next/cache";

export async function getQuransAction(
  page: number = 1,
  pageSize: number = 10,
  categoryId?: number | null,
  categoryName?: string | null,
  title?: string | null,
  search?: string | null,
  sort: string = "latest"
) {
  try {
    return await getQurans(page, pageSize, categoryId, categoryName, title, search, sort);
  } catch (error: any) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) throw error;
    console.error("Error fetching quran items via action:", error);
    return null;
  }
}

export async function deleteQuranAction(id: number | string) {
  try {
    await deleteQuran(id);

    revalidateTag("quran-list");
    revalidateTag(`quran-${id}`);
    revalidatePath("/admin/quran");
    revalidatePath("/quran");

    return {
      success: true,
      message: "تم حذف تسجيل القرآن بنجاح",
      status: 200,
    };
  } catch (error: any) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) throw error;

    if (error instanceof ApiError) {
      return {
        success: false,
        message: error.message || "فشل حذف تسجيل القرآن",
        status: error.status,
      };
    }

    return {
      success: false,
      message: "حدث خطأ غير متوقع أثناء محاولة حذف تسجيل القرآن",
      status: 500,
    };
  }
}

export async function createQuranAction(formData: FormData) {
  try {
    const res = await createQuran(formData);

    revalidateTag("quran-list");
    revalidatePath("/admin/quran");
    revalidatePath("/quran");

    return {
      success: true,
      message: "تم إضافة تسجيل القرآن بنجاح",
      data: res?.data,
      status: 201,
    };
  } catch (error: any) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) throw error;

    if (error instanceof ApiError) {
      return {
        success: false,
        message: error.message || "فشل إضافة تسجيل القرآن",
        errors: error.errors,
        status: error.status,
      };
    }

    return {
      success: false,
      message: "حدث خطأ غير متوقع أثناء إضافة تسجيل القرآن",
      errors: null,
      status: 500,
    };
  }
}

export async function updateQuranAction(id: number | string, formData: FormData) {
  try {
    const res = await updateQuran(id, formData);

    revalidateTag("quran-list");
    revalidateTag(`quran-${id}`);
    revalidatePath("/admin/quran");
    revalidatePath(`/admin/quran/${id}`);
    revalidatePath(`/admin/quran/${id}/edit`);
    revalidatePath("/quran");

    return {
      success: true,
      message: "تم تحديث تسجيل القرآن بنجاح",
      data: res?.data,
      status: 200,
    };
  } catch (error: any) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) throw error;

    if (error instanceof ApiError) {
      return {
        success: false,
        message: error.message || "فشل تحديث تسجيل القرآن",
        errors: error.errors,
        status: error.status,
      };
    }

    return {
      success: false,
      message: "حدث خطأ غير متوقع أثناء تحديث تسجيل القرآن",
      errors: null,
      status: 500,
    };
  }
}
