import React from "react";
import { Metadata } from "next";
import CreateCategoryForm from "@/components/categories/CreateCategoryForm";

export const metadata: Metadata = {
  title: "إضافة تصنيف جديد | لوحة التحكم",
  description: "إضافة تصنيف رئيسي أو فرعي جديد إلى النظام",
};

export default function CreateCategoryPage() {
  return (
    <div className="py-2">
      <CreateCategoryForm />
    </div>
  );
}
