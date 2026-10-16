import React from "react";
import { Metadata } from "next";
import UserProfileView from "@/components/user-profile/UserProfileView";
import { getProfile } from "@/api/admin/users";

export const metadata: Metadata = {
  title: "الملف الشخصي | لوحة تحكم الشيخ أبو ذر",
  description: "إدارة بيانات حساب المسؤول والصورة وكلمة المرور في لوحة تحكم الشيخ أبو ذر",
};

export default async function ProfilePage() {
  let initialUser = null;
  try {
    initialUser = await getProfile();
  } catch (error: any) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) throw error;
    console.error("Profile page load error:", error?.message);
  }

  return <UserProfileView initialUser={initialUser} />;
}
