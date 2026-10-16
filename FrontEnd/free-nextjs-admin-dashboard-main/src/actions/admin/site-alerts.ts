"use server";

import { ApiError } from "@/api/Config";
import {
  getSiteAlerts,
  createSiteAlert,
  updateSiteAlert,
  deleteSiteAlert,
} from "@/api/admin/site-alerts";
import {
  CreateSiteAlertInput,
  UpdateSiteAlertInput,
  SiteAlertItem,
} from "@/types/site-alert";
import { revalidatePath, revalidateTag } from "next/cache";

export async function getSiteAlertsAction() {
  try {
    return await getSiteAlerts();
  } catch (error: any) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) throw error;
    console.error("Error fetching site alerts via action:", error);
    return null;
  }
}

export async function createSiteAlertAction(data: CreateSiteAlertInput) {
  try {
    const res = await createSiteAlert(data);

    revalidateTag("site-alerts-list");
    revalidatePath("/admin/site-alerts");

    return {
      success: true,
      message: "تم إنشاء التنبيه بنجاح",
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
      message: "فشل إنشاء التنبيه. يرجى المحاولة مرة أخرى.",
      errors: null,
      status: 500,
    };
  }
}

export async function updateSiteAlertAction(
  id: number,
  data: UpdateSiteAlertInput
) {
  try {
    const res = await updateSiteAlert(id, data);

    revalidateTag("site-alerts-list");
    revalidatePath("/admin/site-alerts");

    return {
      success: true,
      message: "تم تعديل التنبيه بنجاح",
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
      message: "فشل تعديل التنبيه. يرجى المحاولة مرة أخرى.",
      errors: null,
      status: 500,
    };
  }
}

export async function toggleSiteAlertStatusAction(
  id: number,
  currentAlert: { title: string; content: string; isActive: boolean }
) {
  try {
    const nextStatus = !currentAlert.isActive;
    const res = await updateSiteAlert(id, {
      title: currentAlert.title,
      content: currentAlert.content,
      isActive: nextStatus,
    });

    revalidateTag("site-alerts-list");
    revalidatePath("/admin/site-alerts");

    return {
      success: true,
      message: nextStatus ? "تم تفعيل التنبيه بنجاح" : "تم تعطيل التنبيه بنجاح",
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
      message: "فشل تغيير حالة التنبيه.",
      errors: null,
      status: 500,
    };
  }
}

export async function deleteSiteAlertAction(id: number) {
  try {
    const res = await deleteSiteAlert(id);

    revalidateTag("site-alerts-list");
    revalidatePath("/admin/site-alerts");

    return {
      success: true,
      message: "تم حذف التنبيه بنجاح",
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
      message: "فشل حذف التنبيه. يرجى المحاولة مرة أخرى.",
      errors: null,
      status: 500,
    };
  }
}
