"use client";

import React, { useState, useTransition, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { deleteQuranAction, getQuransAction } from "@/actions/admin/quran";
import { getAllCategoriesAction } from "@/actions/admin/categories";
import {
  FolderIcon,
  TrashBinIcon,
  CloseIcon,
  VideoIcon,
  AudioIcon,
  TimeIcon,
  EyeIcon,
  CalenderIcon,
  PencilIcon,
} from "@/icons";
import {
  DataTable,
  DataTableFilter,
  DataTablePagination,
  DeleteConfirmModal,
  ColumnDef,
  FilterField,
} from "@/components/common/data-table";

export interface QuranItem {
  id: number;
  title: string;
  description?: string | null;
  audioFilePath?: string | null;
  videoFilePath?: string | null;
  thumbnailPath?: string | null;
  durationInMinutes?: number | null;
  surahNumber?: number | null;
  surahName?: string | null;
  publishDate?: string | null;
  createdAt: string;
  categoryId: number;
  categoryName: string;
}

export interface CategoryOption {
  id: number;
  name: string;
  parentId?: number | null;
}

interface QuranTableProps {
  initialQurans: QuranItem[];
  initialTotalCount?: number;
  initialPage?: number;
  initialPageSize?: number;
  initialCategoryId?: string;
  initialSearch?: string;
  initialSort?: string;
  initialCategories?: CategoryOption[];
}

export default function QuranTable({
  initialQurans,
  initialTotalCount,
  initialPage = 1,
  initialPageSize = 10,
  initialCategoryId = "all",
  initialSearch = "",
  initialSort = "latest",
  initialCategories = [],
}: QuranTableProps) {
  const [qurans, setQurans] = useState<QuranItem[]>(initialQurans);
  const [totalCount, setTotalCount] = useState<number>(
    initialTotalCount ?? initialQurans.length
  );
  const [searchTitle, setSearchTitle] = useState(initialSearch);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(initialCategoryId);
  const [selectedSort, setSelectedSort] = useState<string>(initialSort);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [itemsPerPage, setItemsPerPage] = useState(initialPageSize);
  const [isFetching, setIsFetching] = useState(false);
  const [categoriesList, setCategoriesList] = useState<CategoryOption[]>(initialCategories);
  const isInitialMount = useRef(true);

  // Modals state
  const [quranToDelete, setQuranToDelete] = useState<QuranItem | null>(null);
  const [quranToPreview, setQuranToPreview] = useState<QuranItem | null>(null);
  const [isDeleting, startDeleteTransition] = useTransition();
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Helper for media URLs
  const getMediaUrl = (path: string | null | undefined) => {
    if (!path) return null;
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7281";
    return `${baseUrl}${path.startsWith("/") ? "" : "/"}${path}`;
  };

  // Helper for date formatting
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

  // Populate categories if not passed initially
  useEffect(() => {
    if (categoriesList.length === 0) {
      getAllCategoriesAction(4).then((res) => {
        if (res && Array.isArray(res)) {
          setCategoriesList(
            res.map((c: any) => ({
              id: c.id,
              name: c.name,
              parentId: c.parentId ?? null,
            }))
          );
        }
      });
    }
  }, [categoriesList.length]);

  // Format categories options with parent-child grouping
  const categoryOptions = useMemo(() => {
    const parentMap = new Map<number, string>();
    const parentIds = new Set<number>();

    categoriesList.forEach((c) => {
      if (c.parentId) {
        parentIds.add(c.parentId);
      }
    });

    categoriesList.forEach((c) => {
      if (parentIds.has(c.id)) {
        parentMap.set(c.id, c.name);
      }
    });

    const standaloneOptions: { label: string; value: string }[] = [];
    const groupedOptions: { label: string; value: string; group: string }[] = [];
    const seenCategoryIds = new Set<number>();

    categoriesList.forEach((c) => {
      if (parentIds.has(c.id)) {
        return;
      }
      seenCategoryIds.add(c.id);

      if (c.parentId && parentMap.has(c.parentId)) {
        groupedOptions.push({
          label: c.name,
          value: String(c.id),
          group: parentMap.get(c.parentId)!,
        });
      } else {
        standaloneOptions.push({
          label: c.name,
          value: String(c.id),
        });
      }
    });

    qurans.forEach((q) => {
      if (q.categoryId && !seenCategoryIds.has(q.categoryId)) {
        seenCategoryIds.add(q.categoryId);
        standaloneOptions.push({
          label: q.categoryName || `تصنيف ${q.categoryId}`,
          value: String(q.categoryId),
        });
      }
    });

    return [
      { label: "جميع التصنيفات", value: "all" },
      ...standaloneOptions,
      ...groupedOptions,
    ];
  }, [categoriesList, qurans]);

  // Fetch Qurans with pagination & filters
  const fetchQurans = async (
    page: number,
    pageSize: number,
    categoryIdVal: string,
    searchVal: string,
    sortVal: string
  ) => {
    setIsFetching(true);
    try {
      const categoryIdNum =
        categoryIdVal !== "all" && Number(categoryIdVal) > 0
          ? Number(categoryIdVal)
          : null;
      const searchParam = searchVal.trim() ? searchVal.trim() : null;

      const res = await getQuransAction(
        page,
        pageSize,
        categoryIdNum,
        null,
        searchParam,
        searchParam,
        sortVal
      );

      if (res?.data?.items && Array.isArray(res.data.items)) {
        setQurans(res.data.items);
        setTotalCount(res.data.totalCount ?? res.data.items.length);
      } else if (res?.data && Array.isArray(res.data)) {
        setQurans(res.data);
        setTotalCount(res.data.length);
      } else {
        setQurans([]);
        setTotalCount(0);
      }
    } catch (error) {
      console.error("Error fetching quran items:", error);
      setFeedback({
        type: "error",
        message: "حدث خطأ أثناء تحميل البيانات، يرجى المحاولة لاحقاً",
      });
    } finally {
      setIsFetching(false);
    }
  };

  // Sync when filters change
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const timer = setTimeout(() => {
      fetchQurans(currentPage, itemsPerPage, selectedCategoryId, searchTitle, selectedSort);
    }, 350);

    return () => clearTimeout(timer);
  }, [searchTitle, selectedCategoryId, selectedSort, currentPage, itemsPerPage]);

  const handleFilterChange = (key: string, value: string) => {
    setCurrentPage(1);
    if (key === "search") {
      setSearchTitle(value);
    } else if (key === "categoryId") {
      setSelectedCategoryId(value);
    } else if (key === "sort") {
      setSelectedSort(value);
    }
  };

  const handleFilterReset = () => {
    setSearchTitle("");
    setSelectedCategoryId("all");
    setSelectedSort("latest");
    setCurrentPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handlePageSizeChange = (newSize: number) => {
    setItemsPerPage(newSize);
    setCurrentPage(1);
  };

  // Delete Action
  const confirmDelete = () => {
    if (!quranToDelete) return;

    startDeleteTransition(async () => {
      try {
        const res = await deleteQuranAction(quranToDelete.id);
        if (res.success) {
          setFeedback({
            type: "success",
            message: res.message || "تم حذف المقطع بنجاح",
          });
          setQuranToDelete(null);
          const targetPage =
            qurans.length === 1 && currentPage > 1 ? currentPage - 1 : currentPage;
          fetchQurans(targetPage, itemsPerPage, selectedCategoryId, searchTitle, selectedSort);
        } else {
          setFeedback({
            type: "error",
            message: res.message || "فشل حذف المقطع",
          });
        }
      } catch (err: any) {
        setFeedback({
          type: "error",
          message: err?.message || "حدث خطأ أثناء الحذف",
        });
      }

      setTimeout(() => {
        setFeedback(null);
      }, 5000);
    });
  };

  // Columns definition
  const columns: ColumnDef<QuranItem>[] = [
    {
      header: "#",
      className: "w-12 text-center",
      render: (_item: QuranItem, index: number) => (
        <span className="text-gray-500 dark:text-gray-400 font-mono text-xs">
          {(currentPage - 1) * itemsPerPage + index + 1}
        </span>
      ),
    },
    {
      header: "عنوان التلاوة والتدبر",
      render: (item: QuranItem) => (
        <div className="flex items-center gap-3 max-w-sm">
          {item.thumbnailPath ? (
            <img
              src={getMediaUrl(item.thumbnailPath)!}
              alt={item.title}
              className="w-11 h-11 rounded-lg object-cover border border-gray-200 dark:border-gray-700 shrink-0"
            />
          ) : (
            <div className="w-11 h-11 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-800/40">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          )}
          <div className="flex flex-col min-w-0">
            <Link
              href={`/admin/quran/${item.id}`}
              className="font-medium text-gray-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors line-clamp-1"
              title={item.title}
            >
              {item.title}
            </Link>
            <div className="flex items-center gap-2 mt-0.5">
              {item.surahName && (
                <span className="inline-flex items-center text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
                  سورة {item.surahName} {item.surahNumber ? `(${item.surahNumber})` : ""}
                </span>
              )}
              {item.durationInMinutes && item.durationInMinutes > 0 ? (
                <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                  <TimeIcon className="w-3.5 h-3.5" />
                  {item.durationInMinutes} دقيقة
                </span>
              ) : null}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "التصنيف",
      render: (item: QuranItem) => (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
          <FolderIcon className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
          {item.categoryName || "غير مصنف"}
        </span>
      ),
    },
    {
      header: "الوسائط",
      render: (item: QuranItem) => (
        <div className="flex items-center gap-2">
          {item.audioFilePath ? (
            <button
              type="button"
              onClick={() => setQuranToPreview(item)}
              title="معاينة الصوت"
              className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300 dark:hover:bg-emerald-900/50 transition-colors"
            >
              <AudioIcon className="w-3.5 h-3.5" />
              صوتي
            </button>
          ) : null}

          {item.videoFilePath ? (
            <button
              type="button"
              onClick={() => setQuranToPreview(item)}
              title="معاينة المرئي"
              className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-purple-50 text-purple-700 hover:bg-purple-100 dark:bg-purple-900/30 dark:text-purple-300 dark:hover:bg-purple-900/50 transition-colors"
            >
              <VideoIcon className="w-3.5 h-3.5" />
              مرئي
            </button>
          ) : null}

          {!item.audioFilePath && !item.videoFilePath && (
            <span className="text-xs text-gray-400 dark:text-gray-500">لا يوجد</span>
          )}
        </div>
      ),
    },
    {
      header: "تاريخ النشر",
      render: (item: QuranItem) => (
        <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300">
          <CalenderIcon className="w-3.5 h-3.5 text-gray-400" />
          {formatDate(item.publishDate || item.createdAt)}
        </div>
      ),
    },
    {
      header: "الإجراءات",
      className: "w-28 text-center",
      render: (item: QuranItem) => (
        <div className="flex items-center justify-center gap-1.5">
          <Link
            href={`/admin/quran/${item.id}`}
            title="معاينة"
            className="p-1.5 text-gray-600 hover:text-emerald-600 hover:bg-gray-100 rounded-lg dark:text-gray-400 dark:hover:text-emerald-400 dark:hover:bg-gray-800 transition-colors"
          >
            <EyeIcon className="w-4 h-4" />
          </Link>
          <Link
            href={`/admin/quran/${item.id}/edit`}
            title="تعديل"
            className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-lg dark:text-gray-400 dark:hover:text-blue-400 dark:hover:bg-gray-800 transition-colors"
          >
            <PencilIcon className="w-4 h-4" />
          </Link>
          <button
            type="button"
            onClick={() => setQuranToDelete(item)}
            title="حذف"
            className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded-lg dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-gray-800 transition-colors"
          >
            <TrashBinIcon className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const filterFields: FilterField[] = [
    {
      key: "search",
      label: "البحث بالاسم أو السورة",
      type: "search",
      placeholder: "ابحث باسم التلاوة أو اسم السورة...",
    },
    {
      key: "categoryId",
      label: "التصنيف",
      type: "select",
      options: categoryOptions,
    },
    {
      key: "sort",
      label: "الترتيب حسب التاريخ",
      type: "select",
      options: [
        { label: "الأحدث أولاً (تنازلي)", value: "latest" },
        { label: "الأقدم أولاً (تصاعدي)", value: "oldest" },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Feedback Alert */}
      {feedback && (
        <div
          className={`flex items-center justify-between p-4 rounded-xl border ${
            feedback.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300"
              : "bg-red-50 border-red-200 text-red-800 dark:bg-red-950/40 dark:border-red-800 dark:text-red-300"
          }`}
        >
          <span className="text-sm font-medium">{feedback.message}</span>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/5"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filters (Search + Category + Newest/Oldest Sort) */}
      <DataTableFilter
        title="تصفية وبحث في القرآن الكريم"
        fields={filterFields}
        values={{
          search: searchTitle,
          categoryId: selectedCategoryId,
          sort: selectedSort,
        }}
        totalCount={totalCount}
        itemUnitName="مقطع"
        isFetching={isFetching}
        onChange={handleFilterChange}
        onReset={handleFilterReset}
      />

      {/* Main Data Table */}
      <DataTable<QuranItem>
        title="تسجيلات وتلاوات القرآن الكريم ومجالس التدبر"
        totalCount={totalCount}
        createButton={{
          label: "إضافة مقطع قرآن جديد",
          href: "/admin/quran/create",
        }}
        isFetching={isFetching}
        columns={columns}
        data={qurans}
        emptyMessage="لم يتم العثور على أي مقاطع أو تلاوات للقرآن الكريم مطابقة لمعايير البحث."
        getRowKey={(item) => item.id}
        pagination={
          <DataTablePagination
            totalCount={totalCount}
            currentPage={currentPage}
            pageSize={itemsPerPage}
            isFetching={isFetching}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        }
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!quranToDelete}
        title="تأكيد حذف المقطع"
        itemName={quranToDelete?.title}
        itemId={quranToDelete?.id}
        message={`هل أنت متأكد من رغبتك في حذف المقطع "${quranToDelete?.title}"؟ لا يمكن التراجع عن هذه العملية بعد إتمامها.`}
        isDeleting={isDeleting}
        onClose={() => setQuranToDelete(null)}
        onConfirm={confirmDelete}
      />

      {/* Media Quick Preview Modal */}
      {quranToPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
              <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">
                {quranToPreview.title}
              </h3>
              <button
                type="button"
                onClick={() => setQuranToPreview(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {quranToPreview.audioFilePath && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                    الملف الصوتي:
                  </label>
                  <audio
                    controls
                    className="w-full"
                    src={getMediaUrl(quranToPreview.audioFilePath)!}
                  />
                </div>
              )}

              {quranToPreview.videoFilePath && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                    المقطع المرئي:
                  </label>
                  <video
                    controls
                    className="w-full rounded-lg max-h-64 bg-black"
                    src={getMediaUrl(quranToPreview.videoFilePath)!}
                  />
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setQuranToPreview(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 rounded-xl transition-colors"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
