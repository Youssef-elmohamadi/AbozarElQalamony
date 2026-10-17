import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getQuranById } from "@/api/admin/quran";
import EditQuranForm from "@/components/quran/EditQuranForm";

export const metadata: Metadata = {
  title: "تعديل تسجيل القرآن الكريم | لوحة التحكم",
  description: "تعديل بيانات وملفات ومحتوى التلاوة أو المقطع القرآني",
};

interface EditQuranPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditQuranPage({ params }: EditQuranPageProps) {
  const { id } = await params;

  let item = null;
  try {
    item = await getQuranById(id);
  } catch (error) {
    console.error(`Error loading quran item ${id}:`, error);
  }

  if (!item) {
    notFound();
  }

  return (
    <div className="py-2">
      <EditQuranForm quran={item} />
    </div>
  );
}
