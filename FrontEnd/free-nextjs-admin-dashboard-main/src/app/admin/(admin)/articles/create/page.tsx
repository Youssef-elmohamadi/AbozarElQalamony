import React from "react";
import { Metadata } from "next";
import CreateArticleForm from "@/components/articles/CreateArticleForm";

export const metadata: Metadata = {
  title: "إضافة مقال جديد | لوحة التحكم",
  description: "إنشاء ونشر مقال جديد في لوحة تحكم الشيخ أبو ذر",
};

export default function CreateArticlePage() {
  return (
    <div className="py-2">
      <CreateArticleForm />
    </div>
  );
}
