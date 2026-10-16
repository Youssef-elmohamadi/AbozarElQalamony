"use server";

import { getDashboardStats } from "@/api/admin/dashboard";

export async function getDashboardStatsAction() {
  try {
    const stats = await getDashboardStats();
    return {
      success: Boolean(stats),
      data: stats,
      message: stats ? "تم جلب الإحصائيات بنجاح" : "تعذر جلب الإحصائيات",
    };
  } catch (error: any) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) throw error;
    console.error("Error fetching dashboard stats via action:", error);
    return {
      success: false,
      data: null,
      message: "حدث خطأ غير متوقع",
    };
  }
}
