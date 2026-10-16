import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getArticleById } from "@/api/admin/articles";
import EditArticleForm from "@/components/articles/EditArticleForm";

export const metadata: Metadata = {
  title: "تعديل المقال | لوحة التحكم",
  description: "تعديل محتوى وبيانات المقال",
};

interface EditArticlePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditArticlePage({ params }: EditArticlePageProps) {
  const { id } = await params;

  let article = null;
  try {
    article = await getArticleById(id);
  } catch (error) {
    console.error(`Error loading article ${id}:`, error);
  }

  if (!article) {
    notFound();
  }

  return (
    <div className="py-2">
      <EditArticleForm article={article} />
    </div>
  );
}
