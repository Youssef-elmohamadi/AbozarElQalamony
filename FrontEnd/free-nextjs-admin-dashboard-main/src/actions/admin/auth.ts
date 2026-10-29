"use server";

import { apiFetch, ApiError } from "../../api/Config";
import { logout } from "../../api/admin/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function loginAction(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    const response = await apiFetch(
      process.env.NEXT_PUBLIC_API_URL || "http://abuzarelqalamony.somee.com",
      "/api/admin/Users/login",
      {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }
    );

    const token = response?.data;

    if (!token) {
      return {
        error: { message: "لم يتم استلام التوكن من السيرفر", errors: null, status: 500 },
        email,
      };
    }

    const cookieStore = await cookies();

    cookieStore.set("admin_token", token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
  } catch (error: any) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) throw error;

    if (error instanceof ApiError) {
      return {
        error: {
          message: error.message,
          errors: error.errors,
          status: error.status,
        },
        email,
      };
    }

    return {
      error: { message: "حدث خطأ غير متوقع", errors: null, status: 500 },
      email,
    };
  }

  redirect("/admin");
}

export async function logoutAction() {
  try {
    await logout();
  } catch (error: any) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) throw error;
  }

  const cookieStore = await cookies();
  cookieStore.delete("admin_token");
  redirect("/admin/login");
}