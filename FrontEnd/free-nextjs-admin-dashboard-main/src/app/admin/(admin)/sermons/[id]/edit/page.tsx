import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSermonById } from "@/api/admin/sermons";
import EditSermonForm from "@/components/sermons/EditSermonForm";

export const metadata: Metadata = {
  title: "تعديل الخطبة | لوحة التحكم",
  description: "تعديل بيانات وملفات ومحتوى وتاريخ الخطبة المنبرية",
};

interface EditSermonPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditSermonPage({ params }: EditSermonPageProps) {
  const { id } = await params;

  let sermon = null;
  try {
    sermon = await getSermonById(id);
  } catch (error) {
    console.error(`Error loading sermon ${id}:`, error);
  }

  if (!sermon) {
    notFound();
  }

  return (
    <div className="py-2">
      <EditSermonForm sermon={sermon} />
    </div>
  );
}
