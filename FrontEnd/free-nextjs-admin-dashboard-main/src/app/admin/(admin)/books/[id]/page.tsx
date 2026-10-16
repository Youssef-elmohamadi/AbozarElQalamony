import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBookById, BookItem } from "@/api/admin/books";
import {
  FolderIcon,
  FileIcon,
  DocsIcon,
  DownloadIcon,
  UserIcon,
  CalenderIcon,
  PencilIcon,
} from "@/icons";

interface BookDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: BookDetailsPageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const book = await getBookById(id);
    if (book) {
      return {
        title: `${book.title} | لوحة التحكم`,
        description: book.description || "معاينة تفاصيل الكتاب",
      };
    }
  } catch {}
  return {
    title: "معاينة الكتاب | لوحة التحكم",
  };
}

export default async function BookDetailsPage({ params }: BookDetailsPageProps) {
  const { id } = await params;
  let book: BookItem | null = null;

  try {
    book = await getBookById(id);
  } catch (error) {
    console.error("Error fetching book:", error);
  }

  if (!book) {
    notFound();
  }

  const getMediaUrl = (path: string | null | undefined) => {
    if (!path) return null;
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7281";
    return `${baseUrl}${path.startsWith("/") ? "" : "/"}${path}`;
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "—";
    try {
      return new Intl.DateTimeFormat("ar-EG", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(new Date(dateString));
    } catch {
      return dateString;
    }
  };

  const pdfUrl = getMediaUrl(book.pdfFilePath);
  const coverUrl = getMediaUrl(book.coverImagePath);

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-1">
            <Link href="/admin/books" className="hover:text-brand-600 transition-colors">
              الكتب والمؤلفات
            </Link>
            <span>/</span>
            <span>تفاصيل الكتاب #{book.id}</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {book.title}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/admin/books/${book.id}/edit`}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-xs"
          >
            <PencilIcon className="w-3.5 h-3.5 fill-current shrink-0" />
            <span>تعديل الكتاب</span>
          </Link>
          <Link
            href="/admin/books"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 transition-colors"
          >
            <span>العودة للقائمة</span>
          </Link>
        </div>
      </div>

      {/* Main Showcase Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-6">
        {/* Meta badges */}
        <div className="flex items-center gap-3 flex-wrap text-xs">
          <span className="font-mono font-bold text-gray-400 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-lg">
            المعرف: #{book.id}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg font-semibold bg-[#3F4A2B]/10 text-[#3F4A2B] dark:bg-[#3F4A2B]/20 dark:text-[#DFE5D7]">
            <FolderIcon className="w-3.5 h-3.5 fill-current shrink-0" />
            <span>{book.categoryName || "بدون تصنيف"}</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
            <UserIcon className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span>المؤلف: {book.authorName}</span>
          </span>
          {book.publishDate && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
              <CalenderIcon className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span>تاريخ النشر: {formatDate(book.publishDate)}</span>
            </span>
          )}
        </div>

        {/* Content Layout: Cover Image & PDF Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Cover Image */}
          {coverUrl ? (
            <div className="md:col-span-1 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40 p-3 flex flex-col items-center justify-center">
              <img
                src={coverUrl}
                alt={book.title}
                className="max-h-72 object-contain rounded-xl shadow-xs"
              />
            </div>
          ) : (
            <div className="md:col-span-1 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 p-8 flex flex-col items-center justify-center text-center text-xs text-gray-400">
              <DocsIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-2" />
              <span>لا توجد صورة غلاف مرفقة</span>
            </div>
          )}

          {/* Book Info & PDF Download */}
          <div className="md:col-span-2 space-y-4 flex flex-col justify-between">
            {/* Description */}
            <div className="p-5 rounded-2xl bg-gray-50/70 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 flex-1">
              <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2">
                نبذة ووصف الكتاب:
              </h3>
              <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
                {book.description || "لا توجد نبذة أو وصف مدخل لهذا الكتاب."}
              </p>
            </div>

            {/* PDF File Card */}
            {pdfUrl ? (
              <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/40 text-rose-600 flex items-center justify-center shrink-0">
                    <FileIcon className="w-5 h-5 fill-current shrink-0" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-rose-900 dark:text-rose-200">
                      ملف الكتاب الإلكتروني (PDF)
                    </h4>
                    <p className="text-[11px] text-rose-700/80 dark:text-rose-400">
                      متاح للقراءة والتحميل المباشر
                    </p>
                  </div>
                </div>

                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-xs shrink-0"
                >
                  <DownloadIcon className="w-3.5 h-3.5 shrink-0" />
                  <span>فتح وتحميل الكتاب</span>
                </a>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/40 text-center text-xs text-gray-400 border border-gray-100 dark:border-gray-800">
                لا يوجد ملف PDF مرفق بهذا الكتاب حالياً.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
