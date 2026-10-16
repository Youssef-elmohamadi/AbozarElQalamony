import React from "react";
import { Metadata } from "next";
import CreateUserForm from "@/components/users/CreateUserForm";

export const metadata: Metadata = {
  title: "إضافة مستخدم جديد | لوحة التحكم",
  description: "إضافة مسؤول أو مستخدم جديد إلى النظام وتحديد صلاحياته",
};

export default function CreateUserPage() {
  return (
    <div className="py-2">
      <CreateUserForm />
    </div>
  );
}
