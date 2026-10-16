"use client";

import React from "react";
import { Modal } from "@/components/ui/modal";
import { ArticleItem } from "@/types/article";
import { CalenderIcon, CloseIcon } from "@/icons";

interface ArticlePreviewModalProps {
  article: ArticleItem | null;
  onClose: () => void;
}

export default function ArticlePreviewModal({
  article,
  onClose,
}: ArticlePreviewModalProps) {
  if (!article) return null;

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "—";
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("ar-EG", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(date);
    } catch {
      return dateString;
    }
  };

  return (
    <Modal
      isOpen={!!article}
      onClose={onClose}
      showCloseButton={false}
      className="max-w-[760px] m-4"
    >
      <div
        dir="rtl"
        className="relative w-full max-h-[85vh] overflow-y-auto rounded-3xl bg-white p-6 md:p-8 dark:bg-gray-900 text-right"
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
          <div className="space-y-2 pe-4">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs px-2.5 py-0.5 rounded-full font-bold bg-[#3F4A2B]/10 text-[#3F4A2B] dark:bg-[#3F4A2B]/25 dark:text-[#DFE5D7]">
                #{article.id}
              </span>
              <span className="text-xs text-gray-400">معاينة المقال</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white leading-relaxed">
              {article.title}
            </h2>
            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400 pt-1">
              <div className="flex items-center gap-1.5">
                <CalenderIcon className="w-3.5 h-3.5 text-[#3F4A2B] dark:text-[#DFE5D7]" />
                <span>
                  تاريخ النشر: {formatDate(article.publishDate || article.createdAt)}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white transition-colors cursor-pointer shrink-0"
            title="إغلاق"
            aria-label="إغلاق"
          >
            <CloseIcon className="w-4 h-4 fill-current" />
          </button>
        </div>

        {/* Short description if available */}
        {article.description && (
          <div className="my-5 p-4 rounded-2xl bg-[#FAFAF5] dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
            <span className="block text-xs font-bold text-[#3F4A2B] dark:text-[#DFE5D7] mb-1">
              نبذة مختصرة:
            </span>
            {article.description}
          </div>
        )}

        {/* Article Body Content */}
        <div className="mt-6 prose prose-stone dark:prose-invert max-w-none text-gray-800 dark:text-gray-200 leading-relaxed text-sm md:text-base">
          <div
            dangerouslySetInnerHTML={{ __html: article.body }}
            className="space-y-4 [&>h2]:text-lg [&>h2]:font-bold [&>h2]:text-[#3F4A2B] dark:[&>h2]:text-[#DFE5D7] [&>h3]:text-base [&>h3]:font-bold [&>ul]:list-disc [&>ul]:pr-5 [&>ol]:list-decimal [&>ol]:pr-5 [&>blockquote]:border-r-4 [&>blockquote]:border-[#3F4A2B] [&>blockquote]:pr-4 [&>blockquote]:italic [&>blockquote]:bg-[#FAFAF5] dark:[&>blockquote]:bg-gray-800/50 [&>blockquote]:p-3 [&>blockquote]:rounded-lg"
          />
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </Modal>
  );
}
