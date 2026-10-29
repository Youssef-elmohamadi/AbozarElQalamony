"use server";

import { ApiError } from "@/api/Config";
import { getBooks, deleteBook, createBook, updateBook } from "@/api/admin/books";
import { revalidatePath, revalidateTag } from "next/cache";

export async function getBooksAction(
  page: number = 1,
  pageSize: number = 10,
  categoryId?: number | null,
  categoryName?: string | null,
  title?: string | null,
  search?: string | null,
  authorName?: string | null
) {
  try {
    return await getBooks(page, pageSize, categoryId, categoryName, title, search, authorName);
  } catch (error: any) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) throw error;
    console.error("Error fetching books via action:", error);
    return null;
  }
}

export async function deleteBookAction(id: number | string) {
  try {
    await deleteBook(id);

    revalidateTag("books-list");
    revalidateTag("books");
    revalidateTag(`book-${id}`);
    revalidateTag("public-home")
    revalidateTag("search")
    revalidatePath("/")
    revalidatePath("/books")
    revalidatePath(`/books/${id}`)
    revalidatePath("/search")
    revalidatePath("/admin/books");


    return {
      success: true,
      message: "تم حذف الكتاب بنجاح",
      status: 200,
    };
  } catch (error: any) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) throw error;

    if (error instanceof ApiError) {
      return {
        success: false,
        message: error.message || "فشل حذف الكتاب",
        status: error.status,
      };
    }

    return {
      success: false,
      message: "حدث خطأ غير متوقع أثناء محاولة حذف الكتاب",
      status: 500,
    };
  }
}

export async function createBookAction(formData: FormData) {
  try {
    const res = await createBook(formData);

    revalidateTag("books-list");
    revalidateTag("books");
    revalidateTag("public-home")
    revalidateTag("search")
    revalidatePath("/")
    revalidatePath("/books")
    revalidatePath("/search")
    revalidatePath("/admin/books");

    return {
      success: true,
      message: "تم إضافة الكتاب بنجاح",
      data: res?.data,
      status: 201,
    };
  } catch (error: any) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) throw error;

    if (error instanceof ApiError) {
      return {
        success: false,
        message: error.message || "فشل إضافة الكتاب",
        errors: error.errors,
        status: error.status,
      };
    }

    return {
      success: false,
      message: "حدث خطأ غير متوقع أثناء إضافة الكتاب",
      errors: null,
      status: 500,
    };
  }
}

export async function updateBookAction(id: number | string, formData: FormData) {
  try {
    const res = await updateBook(id, formData);

    revalidateTag("books-list");
    revalidateTag("books");
    revalidateTag(`book-${id}`);
    revalidateTag("public-home");
    revalidateTag("search");
    revalidatePath("/");
    revalidatePath("/books");
    revalidatePath(`/books/${id}`);
    revalidatePath("/search");
    revalidatePath("/admin/books");
    revalidatePath(`/admin/books/${id}`);
    revalidatePath(`/admin/books/${id}/edit`);
    return {
      success: true,
      message: "تم حفظ تعديلات الكتاب بنجاح",
      data: res?.data,
      status: 200,
    };
  } catch (error: any) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) throw error;

    if (error instanceof ApiError) {
      return {
        success: false,
        message: error.message || "فشل تعديل الكتاب",
        errors: error.errors,
        status: error.status,
      };
    }

    return {
      success: false,
      message: "حدث خطأ غير متوقع أثناء تعديل الكتاب",
      errors: null,
      status: 500,
    };
  }
}

export async function revalidateBooksCacheAction(bookId?: number | string) {
  try {
    revalidateTag("books-list");
    revalidateTag("books");
    revalidatePath("/");
    revalidatePath("/books");
    revalidatePath("/admin/books");
    if (bookId) {
      revalidateTag(`book-${bookId}`);
      revalidateTag("books-list");
      revalidateTag("books");
      revalidateTag("public-home");
      revalidatePath("/");
      revalidatePath(`/admin/books/${bookId}`);
      revalidatePath(`/admin/books/${bookId}/edit`);
      revalidatePath(`/books/${bookId}`);
    }
    return { success: true };
  } catch (err) {
    console.error("Cache revalidation error:", err);
    return { success: false };
  }
}
