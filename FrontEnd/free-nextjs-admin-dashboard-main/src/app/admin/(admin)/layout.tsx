import React from "react";
import { getProfile } from "@/api/admin/users";
import { UserProfile } from "@/types/user";
import AdminLayoutClient from "@/layout/AdminLayoutClient";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let initialUser: UserProfile | null = null;

  try {
    const data = await getProfile();
    if (data && typeof data === "object") {
      initialUser = (data?.data ?? data) as UserProfile;
    }
  } catch (error: any) {
    if (
      error?.digest === "DYNAMIC_SERVER_USAGE" ||
      error?.digest?.startsWith("NEXT_REDIRECT")
    ) {
      throw error;
    }
    console.error("Failed to fetch initial profile in AdminLayout:", error);
  }

  return (
    <AdminLayoutClient initialUser={initialUser}>
      {children}
    </AdminLayoutClient>
  );
}
