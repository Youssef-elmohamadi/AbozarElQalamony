import React from "react";
import { Metadata } from "next";
import CreateBookForm from "@/components/books/CreateBookForm";

export const metadata: Metadata = {
  title: "إضافة كتاب جديد | لوحة التحكم",
  description: "إضافة كتاب أو مصنف جديد مع رفع الغلاف وملف الـ PDF وتحديد التصنيف",
};

export default function CreateBookPage() {
  return (
    <div className="py-2">
      <CreateBookForm />
    </div>
  );
}
