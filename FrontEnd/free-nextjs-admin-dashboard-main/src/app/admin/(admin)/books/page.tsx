import React from "react";
import { Metadata } from "next";
import { getBooks, BookItem } from "@/api/admin/books";
import { getAllCategories } from "@/api/admin/categories";
import BooksTable, { CategoryOption } from "@/components/books/BooksTable";

export const metadata: Metadata = {
  title: "إدارة الكتب والمؤلفات | لوحة التحكم",
  description: "عرض والبحث وإدارة مؤلفات وكتب الشيخ أبو ذر وتصنيفاتها وملفات الـ PDF",
};

interface BooksPageProps {
  searchParams?: Promise<{
    page?: string;
    pageSize?: string;
    categoryId?: string;
    search?: string;
    title?: string;
    name?: string;
    authorName?: string;
  }>;
}

export default async function BooksPage({ searchParams }: BooksPageProps) {
  const params = (await searchParams) || {};
  const page = params.page ? parseInt(params.page, 10) : 1;
  const pageSize = params.pageSize ? parseInt(params.pageSize, 10) : 10;
  const categoryId =
    params.categoryId && params.categoryId !== "all"
      ? parseInt(params.categoryId, 10)
      : null;
  const search = params.search || params.title || params.name || null;
  const authorName = params.authorName || null;

  let books: BookItem[] = [];
  let totalCount = 0;
  let categories: CategoryOption[] = [];

  try {
    const [booksRes, categoriesRes] = await Promise.allSettled([
      getBooks(page, pageSize, categoryId, null, search, search, authorName),
      getAllCategories(1), // 1 = Book categories
    ]);

    if (booksRes.status === "fulfilled" && booksRes.value) {
      const res = booksRes.value;
      if (res?.data?.items && Array.isArray(res.data.items)) {
        books = res.data.items;
        totalCount = res.data.totalCount;
      } else if (res?.data && Array.isArray(res.data)) {
        books = res.data;
        totalCount = res.data.length;
      }
    }

    if (categoriesRes.status === "fulfilled" && Array.isArray(categoriesRes.value)) {
      categories = categoriesRes.value.map((c: any) => ({
        id: c.id,
        name: c.name,
        parentId: c.parentId ?? null,
      }));
    }
  } catch (error) {
    console.error("Error loading books page data:", error);
  }

  return (
    <div className="py-2">
      <BooksTable
        initialBooks={books}
        initialTotalCount={totalCount}
        initialPage={page}
        initialPageSize={pageSize}
        initialCategoryId={categoryId ? String(categoryId) : "all"}
        initialSearch={search || ""}
        initialCategories={categories}
      />
    </div>
  );
}
