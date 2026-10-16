import React from "react";
import { Metadata } from "next";
import { getSiteAlerts } from "@/api/admin/site-alerts";
import { SiteAlertItem } from "@/types/site-alert";
import SiteAlertsTable from "@/components/site-alerts/SiteAlertsTable";

export const metadata: Metadata = {
  title: "تنبيهات الموقع | لوحة التحكم",
  description: "إدارة الإعلانات والتنبيهات العامة المعروضة لزوار الموقع",
};

export const dynamic = "force-dynamic";

export default async function SiteAlertsPage() {
  let alerts: SiteAlertItem[] = [];

  try {
    const res = await getSiteAlerts();
    if (res?.data && Array.isArray(res.data)) {
      alerts = res.data;
    }
  } catch (error) {
    console.error("Error loading site alerts in page:", error);
  }

  return (
    <div className="py-2">
      <SiteAlertsTable initialAlerts={alerts} />
    </div>
  );
}
