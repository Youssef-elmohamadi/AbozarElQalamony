"use client";

import React, { useState, useTransition, useRef, useEffect } from "react";
import Link from "next/link";
import { ArticleItem } from "@/types/article";
import { deleteArticleAction, getArticlesAction } from "@/actions/admin/articles";
import {
  TrashBinIcon,
  CloseIcon,
  EyeIcon,
  CalenderIcon,
  PencilIcon,
  PageIcon,
  CheckCircleIcon,
  AlertIcon,
  PlusIcon,
} from "@/icons";
import {
  DataTable,
  DataTableFilter,
  DataTablePagination,
  DeleteConfirmModal,
  ColumnDef,
  FilterField,
} from "@/components/common/data-table";
import ArticlePreviewModal from "./ArticlePreviewModal";

interface ArticlesTableProps {
  initialArticles: ArticleItem[];
  initialTotalCount?: number;
  initialPage?: number;
  initialPageSize?: number;
  initialSearch?: string;
}

export default function ArticlesTable({
  initialArticles,
  initialTotalCount,
  initialPage = 1,
  initialPageSize = 10,
  initialSearch = "",
}: ArticlesTableProps) {
  const [articles, setArticles] = useState<ArticleItem[]>(initialArticles);
  const [totalCount, setTotalCount] = useState<number>(
    initialTotalCount ?? initialArticles.length
  );
  const [searchTitle, setSearchTitle] = useState(initialSearch);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [itemsPerPage, setItemsPerPage] = useState(initialPageSize);
  const [isFetching, setIsFetching] = useState(false);
  const isInitialMount = useRef(true);

  // Modals state
  const [articleToDelete, setArticleToDelete] = useState<ArticleItem | null>(null);
  const [articleToPreview, setArticleToPreview] = useState<ArticleItem | null>(null);

  const [isDeleting, startDeleteTransition] = useTransition();
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "—";
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("ar-EG", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(date);
    } catch {
      return dateString;
    }
  };

  // Fetch articles with pagination & search
  const fetchArticles = async (
    page: number,
    pageSize: number,
    searchVal: string
  ) => {
    setIsFetching(true);
    try {
      const searchParam = searchVal.trim() ? searchVal.trim() : null;
      const res = await getArticlesAction(page, pageSize, searchParam);

      if (res?.data?.items && Array.isArray(res.data.items)) {
        setArticles(res.data.items);
        setTotalCount(res.data.totalCount ?? res.data.items.length);
      } else if (res?.data && Array.isArray(res.data)) {
        setArticles(res.data);
        setTotalCount(res.data.length);
      } else {
        setArticles([]);
        setTotalCount(0);
      }
      setCurrentPage(page);

      // Sync URL query params
      if (typeof window !== "undefined") {
        const params = new URLSearchParams();
        if (page > 1) params.set("page", String(page));
        if (pageSize !== 10) params.set("pageSize", String(pageSize));
        if (searchVal.trim()) params.set("search", searchVal.trim());
        const qs = params.toString();
        window.history.replaceState(
          null,
          "",
          qs ? `?${qs}` : window.location.pathname
        );
      }
    } catch (err) {
      console.error("Error fetching articles:", err);
    } finally {
      setIsFetching(false);
    }
  };

  // Debounced search on typing
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const timer = setTimeout(() => {
      fetchArticles(1, itemsPerPage, searchTitle);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTitle]);

  const handleFilterChange = (key: string, value: string) => {
    if (key === "search") {
      setSearchTitle(value);
    }
  };

  const handleResetFilters = () => {
    setSearchTitle("");
    fetchArticles(1, itemsPerPage, "");
  };

  const handlePageChange = (newPage: number) => {
    fetchArticles(newPage, itemsPerPage, searchTitle);
  };

  const handlePageSizeChange = (newSize: number) => {
    setItemsPerPage(newSize);
    fetchArticles(1, newSize, searchTitle);
  };

  // Delete handling
  const confirmDelete = () => {
    if (!articleToDelete) return;

    startDeleteTransition(async () => {
      try {
        const res = await deleteArticleAction(articleToDelete.id);
        if (res.success) {
          setFeedback({ type: "success", message: res.message });
          setArticleToDelete(null);
          const targetPage =
            articles.length === 1 && currentPage > 1
              ? currentPage - 1
              : currentPage;
          fetchArticles(targetPage, itemsPerPage, searchTitle);
        } else {
          setFeedback({ type: "error", message: res.message });
        }
      } catch (err: any) {
        setFeedback({
          type: "error",
          message: err?.message || "حدث خطأ أثناء محاولة حذف المقال",
        });
      }

      setTimeout(() => {
        setFeedback(null);
      }, 5000);
    });
  };

  // Filter fields configuration
  const filterFields: FilterField[] = [
    {
      key: "search",
      label: "البحث في المقالات",
      type: "search",
      placeholder: "اكتب عنوان المقال أو جزءاً منه للبحث...",
    },
  ];

  // Table Columns Definition
  const columns: ColumnDef<ArticleItem>[] = [
    {
      header: "المعرف",
      accessor: (article) => (
        <span className="font-mono text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md border border-gray-200 dark:border-gray-700">
          #{article.id}
        </span>
      ),
    },
    {
      header: "المقال",
      render: (article) => (
        <div className="flex items-center gap-3.5 py-1 min-w-[280px]">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#3F4A2B]/15 to-[#3F4A2B]/5 dark:from-[#3F4A2B]/30 dark:to-[#3F4A2B]/10 border border-[#3F4A2B]/20 shrink-0 flex items-center justify-center shadow-2xs">
            <PageIcon className="w-5 h-5 text-[#3F4A2B] dark:text-[#DFE5D7]" />
          </div>

          <div className="flex flex-col min-w-0">
            <h4
              className="font-bold text-gray-900 dark:text-white text-sm line-clamp-1 hover:text-[#3F4A2B] dark:hover:text-[#DFE5D7] transition-colors cursor-pointer"
              onClick={() => setArticleToPreview(article)}
              title={article.title}
            >
              {article.title}
            </h4>
            {article.description && (
              <p
                className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1"
                title={article.description}
              >
                {article.description}
              </p>
            )}
          </div>
        </div>
      ),
    },
    {
      header: "تاريخ النشر",
      render: (article) => (
        <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
          <CalenderIcon className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <span>{formatDate(article.publishDate || article.createdAt)}</span>
        </div>
      ),
    },
    {
      header: "تاريخ الإنشاء",
      render: (article) => (
        <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
          {formatDate(article.createdAt)}
        </span>
      ),
    },
    {
      header: "الإجراءات",
      align: "center",
      headerClassName: "w-[180px] min-w-[180px] text-center whitespace-nowrap",
      className: "w-[180px] min-w-[180px] text-center whitespace-nowrap",
      render: (article) => (
        <div className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap">
          {/* Preview Button */}
          <button
            onClick={() => setArticleToPreview(article)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors cursor-pointer"
            title="معاينة وقراءة المقال"
          >
            <EyeIcon className="w-3.5 h-3.5" />
            <span>معاينة</span>
          </button>

          {/* Edit Page Link */}
          <Link
            href={`/admin/articles/${article.id}/edit`}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-blue-700 dark:text-blue-400 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/40 border border-blue-200 dark:border-blue-900/60 transition-colors"
            title="تعديل المقال في صفحة مخصصة"
          >
            <PencilIcon className="w-3.5 h-3.5 fill-current" />
            <span>تعديل</span>
          </Link>

          {/* Delete Button */}
          <button
            onClick={() => setArticleToDelete(article)}
            className="inline-flex items-center justify-center p-1.5 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
            title="حذف المقال"
          >
            <TrashBinIcon className="w-4 h-4 fill-current" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">

      {/* Feedback Messages */}
      {feedback && (
        <div
          className={`flex items-center justify-between p-4 rounded-xl border animate-in fade-in duration-200 ${
            feedback.type === "success"
              ? "bg-green-50 border-green-200 text-green-800 dark:bg-green-950/30 dark:border-green-800 dark:text-green-300"
              : "bg-red-50 border-red-200 text-red-800 dark:bg-red-950/30 dark:border-red-800 dark:text-red-300"
          }`}
        >
          <div className="flex items-center gap-2 text-sm font-medium">
            {feedback.type === "success" ? (
              <CheckCircleIcon className="w-5 h-5 shrink-0 text-green-600" />
            ) : (
              <AlertIcon className="w-5 h-5 shrink-0 text-red-600" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-1 rounded-lg cursor-pointer"
          >
            <CloseIcon className="w-4 h-4 fill-current" />
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <DataTableFilter
        title="تصفية وبحث المقالات"
        fields={filterFields}
        values={{
          search: searchTitle,
        }}
        totalCount={totalCount}
        itemUnitName="مقال"
        isFetching={isFetching}
        onChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {/* Articles Data Table */}
      <DataTable<ArticleItem>
        title="قائمة المقالات"
        totalCount={totalCount}
        createButton={{
          label: "إضافة مقال جديد",
          href: "/admin/articles/create",
        }}
        isFetching={isFetching}
        columns={columns}
        data={articles}
        emptyMessage="لم يتم العثور على أي مقالات مطابقة لمعايير البحث."
        getRowKey={(article) => article.id}
        pagination={
          <DataTablePagination
            currentPage={currentPage}
            totalCount={totalCount}
            pageSize={itemsPerPage}
            pageSizeOptions={[5, 10, 20, 50]}
            isFetching={isFetching}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        }
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!articleToDelete}
        title="تأكيد حذف المقال"
        itemName={articleToDelete?.title}
        itemId={articleToDelete?.id}
        message={`هل أنت متأكد من رغبتك في حذف المقال "${articleToDelete?.title}" نهائياً من النظام؟ لا يمكن التراجع عن هذا الإجراء.`}
        isDeleting={isDeleting}
        onConfirm={confirmDelete}
        onClose={() => setArticleToDelete(null)}
      />

      {/* Preview Modal */}
      <ArticlePreviewModal
        article={articleToPreview}
        onClose={() => setArticleToPreview(null)}
      />
    </div>
  );
}
