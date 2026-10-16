import React from "react";
import { Metadata } from "next";
import CreateLessonForm from "@/components/lessons/CreateLessonForm";

export const metadata: Metadata = {
  title: "إضافة درس جديد | لوحة التحكم",
  description: "إضافة درس جديد مع رفع الملفات الصوتية والمرئية وتحديد التصنيف",
};

export default function CreateLessonPage() {
  return (
    <div className="py-2">
      <CreateLessonForm />
    </div>
  );
}
