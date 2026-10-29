"use server";

import { apiFetch, ApiError } from "@/api/Config";
import { getUsers, getProfile, updateProfile } from "@/api/admin/users";
import { revalidatePath, revalidateTag } from "next/cache";

type CreateUserInput = {
    name: string;
    email: string;
    password: string;
    roleId: number;
    ProfileImage: File;
};
export async function getUsersAction(
    page: number = 1,
    pageSize: number = 10,
    roleId?: number | null,
    name?: string | null
) {
    try {
        return await getUsers(page, pageSize, roleId, name);
    } catch (error: any) {
        if (error?.digest?.startsWith("NEXT_REDIRECT")) throw error;
        console.error("Error fetching users via action:", error);
        return null;
    }
}

export async function createUserAction(data: FormData) {
    try {
        await apiFetch(
            process.env.NEXT_PUBLIC_API_URL || "http://abuzarelqalamony.somee.com",
            `/api/admin/users/register`,
            { method: "POST", body: data },
            "admin_token"
        );
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
            message: "فشل انشاء المستخدم",
            errors: null,
            status: 500,
        };
    }

    revalidateTag("users-list");
    revalidatePath("/admin/users");

    return {
        success: true,
        message: "تم انشاء المستخدم بنجاح",
        errors: null,
        status: 200,
    };
}
export async function deleteUserAction(id: number) {
    try {
        await apiFetch(
            process.env.NEXT_PUBLIC_API_URL || "http://abuzarelqalamony.somee.com",
            `/api/users/${id}`,
            { method: "DELETE" },
            "admin_token"
        );
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
            message: "فشل حذف المستخدم",
            errors: null,
            status: 500,
        };
    }

    revalidateTag("users-list");
    revalidatePath("/admin/users");

    return {
        success: true,
        message: "تم حذف المستخدم بنجاح",
        errors: null,
        status: 200,
    };
}

export async function updateUserAction(id: number | string, data: FormData) {
    try {
        await apiFetch(
            process.env.NEXT_PUBLIC_API_URL || "http://abuzarelqalamony.somee.com",
            `/api/admin/users/${id}`,
            { method: "PUT", body: data },
            "admin_token"
        );
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
            message: "فشل تعديل بيانات المستخدم",
            errors: null,
            status: 500,
        };
    }

    revalidateTag("users-list");
    revalidatePath("/admin/users");

    return {
        success: true,
        message: "تم حفظ التعديلات بنجاح",
        errors: null,
        status: 200,
    };
}

export async function getProfileAction() {
    try {
        const user = await getProfile();
        return {
            success: true,
            data: user,
            message: "تم جلب بيانات الملف الشخصي بنجاح",
            errors: null,
            status: 200,
        };
    } catch (error: any) {
        if (error?.digest?.startsWith("NEXT_REDIRECT")) throw error;
        console.error("Error fetching profile via action:", error);

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
            message: "فشل تحميل بيانات الملف الشخصي",
            errors: null,
            status: 500,
        };
    }
}

export async function updateProfileAction(data: FormData) {
    try {
        const updatedUser = await updateProfile(data);

        revalidateTag("user-profile");
        revalidateTag("users-list");
        revalidatePath("/admin/profile");
        revalidatePath("/admin");

        return {
            success: true,
            data: updatedUser,
            message: "تم حفظ بيانات الملف الشخصي بنجاح",
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
            message: "فشل تعديل الملف الشخصي",
            errors: null,
            status: 500,
        };
    }
}

