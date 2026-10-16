import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBookById } from "@/api/admin/books";
import EditBookForm from "@/components/books/EditBookForm";

export const metadata: Metadata = {
  title: "تعديل الكتاب | لوحة التحكم",
  description: "تعديل بيانات وملفات وغلاف ومحتوى الكتاب",
};

interface EditBookPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditBookPage({ params }: EditBookPageProps) {
  const { id } = await params;

  let book = null;
  try {
    book = await getBookById(id);
  } catch (error) {
    console.error(`Error loading book ${id}:`, error);
  }

  if (!book) {
    notFound();
  }

  return (
    <div className="py-2">
      <EditBookForm book={book} />
    </div>
  );
}
