import { apiFetch, ApiError } from "../Config";
import { DashboardStats } from "@/types/dashboard";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://abuzarelqalamony.somee.com";

const isRedirect = (error: any) =>
  typeof error?.digest === "string" && error.digest.startsWith("NEXT_REDIRECT");

export const getDashboardStats = async (): Promise<DashboardStats | null> => {
  try {
    const res = await apiFetch(
      BASE_URL,
      "/api/admin/dashboard/stats",
      {
        cache: "no-store",
        next: {
          tags: ["dashboard-stats"],
          revalidate: 60,
        },
      },
      "admin_token"
    );
    return res?.data ?? res ?? null;
  } catch (error: any) {
    if (isRedirect(error)) throw error;
    console.error("Error fetching dashboard stats:", error);
    return null;
  }
};
