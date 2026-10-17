import React from "react";
import { Metadata } from "next";
import CreateQuranForm from "@/components/quran/CreateQuranForm";

export const metadata: Metadata = {
  title: "إضافة تسجيل قرآن جديد | لوحة التحكم",
  description: "إضافة تسجيل أو تلاوة قرآنية جديدة مع رفع الملفات الصوتية والمرئية وتحديد السورة والتصنيف",
};

export default function CreateQuranPage() {
  return (
    <div className="py-2">
      <CreateQuranForm />
    </div>
  );
}
