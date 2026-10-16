import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLessonById } from "@/api/admin/lessons";
import EditLessonForm from "@/components/lessons/EditLessonForm";

export const metadata: Metadata = {
  title: "تعديل الدرس | لوحة التحكم",
  description: "تعديل بيانات وملفات ومحتوى الدرس",
};

interface EditLessonPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditLessonPage({ params }: EditLessonPageProps) {
  const { id } = await params;

  let lesson = null;
  try {
    lesson = await getLessonById(id);
  } catch (error) {
    console.error(`Error loading lesson ${id}:`, error);
  }

  if (!lesson) {
    notFound();
  }

  return (
    <div className="py-2">
      <EditLessonForm lesson={lesson} />
    </div>
  );
}
