import React from "react";
import { Metadata } from "next";
import CreateSermonForm from "@/components/sermons/CreateSermonForm";

export const metadata: Metadata = {
  title: "إضافة خطبة جديدة | لوحة التحكم",
  description: "إضافة خطبة جمعة أو محاضرة منبرية جديدة مع رفع الملفات الصوتية والمرئية وتحديد التصنيف",
};

export default function CreateSermonPage() {
  return (
    <div className="py-2">
      <CreateSermonForm />
    </div>
  );
}
