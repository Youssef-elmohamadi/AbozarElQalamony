import { apiFetch, ApiError } from "../Config";
import {
  SiteAlertItem,
  CreateSiteAlertInput,
  UpdateSiteAlertInput,
} from "@/types/site-alert";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://abuzarelqalamony.somee.com";

const isRedirect = (error: any) =>
  typeof error?.digest === "string" && error.digest.startsWith("NEXT_REDIRECT");

export const getSiteAlerts = async () => {
  try {
    return await apiFetch(
      BASE_URL,
      "/api/admin/site-alerts",
      {
        cache: "no-store",
        next: {
          tags: ["site-alerts-list"],
        },
      },
      "admin_token"
    );
  } catch (error: any) {
    if (isRedirect(error)) throw error;
    console.error("Error fetching site alerts:", error);
    throw new Error(
      error instanceof ApiError ? error.message : "فشل تحميل تنبيهات الموقع"
    );
  }
};

export const createSiteAlert = async (data: CreateSiteAlertInput) => {
  try {
    return await apiFetch(
      BASE_URL,
      "/api/admin/site-alerts",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      "admin_token"
    );
  } catch (error: any) {
    if (isRedirect(error)) throw error;
    console.error("Error creating site alert:", error);
    throw error;
  }
};

export const updateSiteAlert = async (
  id: number | string,
  data: UpdateSiteAlertInput
) => {
  try {
    return await apiFetch(
      BASE_URL,
      `/api/admin/site-alerts/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      },
      "admin_token"
    );
  } catch (error: any) {
    if (isRedirect(error)) throw error;
    console.error(`Error updating site alert ${id}:`, error);
    throw error;
  }
};

export const deleteSiteAlert = async (id: number | string) => {
  try {
    return await apiFetch(
      BASE_URL,
      `/api/admin/site-alerts/${id}`,
      {
        method: "DELETE",
      },
      "admin_token"
    );
  } catch (error: any) {
    if (isRedirect(error)) throw error;
    console.error(`Error deleting site alert ${id}:`, error);
    throw error;
  }
};
