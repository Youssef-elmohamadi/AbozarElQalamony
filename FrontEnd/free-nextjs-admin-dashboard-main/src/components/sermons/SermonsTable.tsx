"use client";

import React, { useState, useTransition, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { deleteSermonAction, getSermonsAction } from "@/actions/admin/sermons";
import { getAllCategoriesAction } from "@/actions/admin/categories";
import {
  FolderIcon,
  TrashBinIcon,
  CloseIcon,
  VideoIcon,
  AudioIcon,
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

export interface SermonItem {
  id: number;
  title: string;
  description?: string | null;
  khutbahDate: string;
  audioFilePath?: string | null;
  videoFilePath?: string | null;
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

interface SermonsTableProps {
  initialSermons: SermonItem[];
  initialTotalCount?: number;
  initialPage?: number;
  initialPageSize?: number;
  initialCategoryId?: string;
  initialSearch?: string;
  initialCategories?: CategoryOption[];
}

export default function SermonsTable({
  initialSermons,
  initialTotalCount,
  initialPage = 1,
  initialPageSize = 10,
  initialCategoryId = "all",
  initialSearch = "",
  initialCategories = [],
}: SermonsTableProps) {
  const [sermons, setSermons] = useState<SermonItem[]>(initialSermons);
  const [totalCount, setTotalCount] = useState<number>(
    initialTotalCount ?? initialSermons.length
  );
  const [searchTitle, setSearchTitle] = useState(initialSearch);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(initialCategoryId);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [itemsPerPage, setItemsPerPage] = useState(initialPageSize);
  const [isFetching, setIsFetching] = useState(false);
  const [categoriesList, setCategoriesList] = useState<CategoryOption[]>(initialCategories);
  const isInitialMount = useRef(true);

  // Modals state
  const [sermonToDelete, setSermonToDelete] = useState<SermonItem | null>(null);
  const [sermonToPreview, setSermonToPreview] = useState<SermonItem | null>(null);
  const [isDeleting, startDeleteTransition] = useTransition();
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Helper for media URLs
  const getMediaUrl = (path: string | null | undefined) => {
    if (!path) return null;
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://abuzarelqalamony.somee.com";
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

  // Load sermon categories if not preloaded
  useEffect(() => {
    if (categoriesList.length === 0) {
      getAllCategoriesAction(3) // 3 = Sermon categories
        .then((data) => {
          if (Array.isArray(data)) {
            setCategoriesList(
              data.map((c: any) => ({
                id: c.id,
                name: c.name,
                parentId: c.parentId ?? null,
              }))
            );
          }
        })
        .catch((err) => {
          console.error("Failed to load categories for filter:", err);
        });
    }
  }, []);

  // Category options for dropdown filter - direct categories grouped by parent
  const categoryOptions = useMemo(() => {
    const parentIds = new Set<number>();
    const parentMap = new Map<number, string>();

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

    const groupedOptions: { label: string; value: string; group?: string }[] = [];
    const standaloneOptions: { label: string; value: string }[] = [];
    const seenCategoryIds = new Set<number>();

    categoriesList.forEach((c) => {
      if (parentIds.has(c.id)) {
        // Parent category (البيرنت) acts as a group header, not a direct item category
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

    // Also include any categories present in current sermons if missing from categoriesList
    sermons.forEach((s) => {
      if (s.categoryId && !seenCategoryIds.has(s.categoryId)) {
        seenCategoryIds.add(s.categoryId);
        standaloneOptions.push({
          label: s.categoryName || `تصنيف ${s.categoryId}`,
          value: String(s.categoryId),
        });
      }
    });

    return [
      { label: "جميع التصنيفات", value: "all" },
      ...standaloneOptions,
      ...groupedOptions,
    ];
  }, [categoriesList, sermons]);

  // Fetch sermons with pagination & filters
  const fetchSermons = async (
    page: number,
    pageSize: number,
    categoryIdVal: string,
    searchVal: string
  ) => {
    setIsFetching(true);
    try {
      const categoryIdNum =
        categoryIdVal !== "all" && Number(categoryIdVal) > 0
          ? Number(categoryIdVal)
          : null;
      const searchParam = searchVal.trim() ? searchVal.trim() : null;

      const res = await getSermonsAction(
        page,
        pageSize,
        categoryIdNum,
        null,
        searchParam,
        searchParam
      );

      if (res?.data?.items && Array.isArray(res.data.items)) {
        setSermons(res.data.items);
        setTotalCount(res.data.totalCount ?? res.data.items.length);
      } else if (res?.data && Array.isArray(res.data)) {
        setSermons(res.data);
        setTotalCount(res.data.length);
      } else {
        setSermons([]);
        setTotalCount(0);
      }
      setCurrentPage(page);

      // Sync URL query params
      if (typeof window !== "undefined") {
        const params = new URLSearchParams();
        if (page > 1) params.set("page", String(page));
        if (pageSize !== 10) params.set("pageSize", String(pageSize));
        if (categoryIdVal !== "all") params.set("categoryId", categoryIdVal);
        if (searchVal.trim()) params.set("search", searchVal.trim());
        const qs = params.toString();
        window.history.replaceState(
          null,
          "",
          qs ? `?${qs}` : window.location.pathname
        );
      }
    } catch (err) {
      console.error("Error fetching sermons:", err);
    } finally {
      setIsFetching(false);
    }
  };

  // Debounced search on typing sermon title
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const timer = setTimeout(() => {
      fetchSermons(1, itemsPerPage, selectedCategoryId, searchTitle);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTitle]);

  // Handlers for filter changes
  const handleFilterChange = (key: string, value: string) => {
    if (key === "search") {
      setSearchTitle(value);
    } else if (key === "categoryId") {
      setSelectedCategoryId(value);
      fetchSermons(1, itemsPerPage, value, searchTitle);
    }
  };

  const handleResetFilters = () => {
    setSearchTitle("");
    setSelectedCategoryId("all");
    fetchSermons(1, itemsPerPage, "all", "");
  };

  const handlePageChange = (newPage: number) => {
    fetchSermons(newPage, itemsPerPage, selectedCategoryId, searchTitle);
  };

  const handlePageSizeChange = (newSize: number) => {
    setItemsPerPage(newSize);
    fetchSermons(1, newSize, selectedCategoryId, searchTitle);
  };

  // Handle Delete Confirmation
  const confirmDelete = () => {
    if (!sermonToDelete) return;

    startDeleteTransition(async () => {
      try {
        const res = await deleteSermonAction(sermonToDelete.id);
        if (res.success) {
          setFeedback({ type: "success", message: res.message });
          setSermonToDelete(null);
          const targetPage =
            sermons.length === 1 && currentPage > 1
              ? currentPage - 1
              : currentPage;
          fetchSermons(targetPage, itemsPerPage, selectedCategoryId, searchTitle);
        } else {
          setFeedback({ type: "error", message: res.message });
        }
      } catch (err: any) {
        setFeedback({
          type: "error",
          message: err?.message || "حدث خطأ أثناء محاولة حذف الخطبة",
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
      label: "البحث باسم الخطبة",
      type: "search",
      placeholder: "اكتب اسم الخطبة للبحث...",
    },
    {
      key: "categoryId",
      label: "التصنيف",
      type: "select",
      options: categoryOptions,
    },
  ];

  // Table Columns Definition
  const columns: ColumnDef<SermonItem>[] = [
    {
      header: "المعرف",
      accessor: (sermon) => (
        <span className="font-mono text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md border border-gray-200 dark:border-gray-700">
          #{sermon.id}
        </span>
      ),
    },
    {
      header: "الخطبة",
      render: (sermon) => {
        return (
          <div className="flex items-center gap-3 py-1 min-w-[240px]">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/15 to-emerald-500/5 dark:from-emerald-500/30 dark:to-emerald-500/10 border border-emerald-500/20 shrink-0 flex items-center justify-center text-emerald-700 dark:text-emerald-300">
              {sermon.videoFilePath ? (
                <VideoIcon className="w-5 h-5 fill-current" />
              ) : (
                <AudioIcon className="w-5 h-5 fill-current" />
              )}
            </div>

            <div className="flex flex-col min-w-0">
              <h4
                className="font-bold text-gray-900 dark:text-white text-sm line-clamp-1 hover:text-[#3F4A2B] dark:hover:text-[#DFE5D7] transition-colors cursor-pointer"
                onClick={() => setSermonToPreview(sermon)}
                title={sermon.title}
              >
                {sermon.title}
              </h4>
              {sermon.description && (
                <p
                  className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1"
                  title={sermon.description}
                >
                  {sermon.description}
                </p>
              )}
            </div>
          </div>
        );
      },
    },
    {
      header: "التصنيف",
      render: (sermon) => (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-[#3F4A2B]/10 text-[#3F4A2B] dark:bg-[#3F4A2B]/20 dark:text-[#DFE5D7] border border-[#3F4A2B]/20">
          <FolderIcon className="w-3.5 h-3.5 fill-current" />
          <span>{sermon.categoryName || "بدون تصنيف"}</span>
        </span>
      ),
    },
    {
      header: "تاريخ إلقاء الخطبة",
      render: (sermon) => (
        <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
          <CalenderIcon className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <span className="font-medium">{formatDate(sermon.khutbahDate)}</span>
        </div>
      ),
    },
    {
      header: "الوسائط",
      render: (sermon) => (
        <div className="flex items-center gap-2 flex-wrap">
          {sermon.videoFilePath && (
            <span
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
              title="يحتوي على فيديو"
            >
              <VideoIcon className="w-3 h-3 fill-current" />
              <span>مرئي</span>
            </span>
          )}

          {sermon.audioFilePath && (
            <span
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
              title="يحتوي على تسجيل صوتي"
            >
              <AudioIcon className="w-3 h-3 fill-current" />
              <span>صوتي</span>
            </span>
          )}

          {!sermon.videoFilePath && !sermon.audioFilePath && (
            <span className="text-xs text-gray-400 dark:text-gray-500">
              بدون وسائط
            </span>
          )}
        </div>
      ),
    },
    {
      header: "الإجراءات",
      align: "center",
      headerClassName: "w-[240px] min-w-[240px] text-center whitespace-nowrap",
      className: "w-[240px] min-w-[240px] text-center whitespace-nowrap",
      render: (sermon) => (
        <div className="inline-flex items-center justify-center gap-2 whitespace-nowrap">
          {/* Quick Preview Button */}
          <button
            type="button"
            onClick={() => setSermonToPreview(sermon)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0"
            title="معاينة تفاصيل الخطبة والوسائط"
          >
            <EyeIcon className="w-3.5 h-3.5 shrink-0" />
            <span>معاينة</span>
          </button>

          {/* Edit Button */}
          <Link
            href={`/admin/sermons/${sermon.id}/edit`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0"
            title="تعديل هذه الخطبة"
          >
            <PencilIcon className="w-3.5 h-3.5 fill-current shrink-0" />
            <span>تعديل</span>
          </Link>

          {/* Delete Button */}
          <button
            type="button"
            onClick={() => setSermonToDelete(sermon)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0"
            title="حذف هذه الخطبة"
          >
            <TrashBinIcon className="w-3.5 h-3.5 fill-current shrink-0" />
            <span>حذف</span>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Feedback Toast Banner */}
      {feedback && (
        <div
          className={`flex items-center justify-between p-4 rounded-xl border animate-in fade-in duration-200 ${feedback.type === "success"
              ? "bg-green-50 border-green-200 text-green-800 dark:bg-green-950/30 dark:border-green-800 dark:text-green-300"
              : "bg-red-50 border-red-200 text-red-800 dark:bg-red-950/30 dark:border-red-800 dark:text-red-300"
            }`}
        >
          <div className="flex items-center gap-3">
            <span
              className={`w-2.5 h-2.5 rounded-full ${feedback.type === "success" ? "bg-green-500" : "bg-red-500"
                }`}
            />
            <p className="text-sm font-semibold">{feedback.message}</p>
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
        title="تصفية وبحث الخطب"
        fields={filterFields}
        values={{
          search: searchTitle,
          categoryId: selectedCategoryId,
        }}
        totalCount={totalCount}
        itemUnitName="خطبة"
        isFetching={isFetching}
        onChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {/* Sermons Data Table */}
      <DataTable<SermonItem>
        title="قائمة الخطب"
        totalCount={totalCount}
        createButton={{
          label: "إضافة خطبة جديدة",
          href: "/admin/sermons/create",
        }}
        isFetching={isFetching}
        columns={columns}
        data={sermons}
        emptyMessage="لم يتم العثور على أي خطب مطابقة لمعايير البحث والتصنيف المحددة."
        getRowKey={(sermon) => sermon.id}
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
        isOpen={!!sermonToDelete}
        title="تأكيد حذف الخطبة"
        itemName={sermonToDelete?.title}
        itemId={sermonToDelete?.id}
        message={`هل أنت متأكد من رغبتك في حذف الخطبة "${sermonToDelete?.title}" نهائياً من النظام؟ لا يمكن التراجع عن هذا الإجراء.`}
        isDeleting={isDeleting}
        onConfirm={confirmDelete}
        onClose={() => setSermonToDelete(null)}
      />

      {/* Preview Modal */}
      {sermonToPreview && (
        <div className="fixed inset-0 z-99999 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-gray-100 dark:border-gray-800 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#3F4A2B]/10 text-[#3F4A2B] dark:bg-[#3F4A2B]/25 dark:text-[#DFE5D7] flex items-center justify-center shrink-0 border border-[#3F4A2B]/20">
                  <AudioIcon className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                      #{sermonToPreview.id}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-[#3F4A2B]/10 text-[#3F4A2B] dark:text-[#DFE5D7]">
                      <FolderIcon className="w-3 h-3 fill-current" />
                      <span>{sermonToPreview.categoryName}</span>
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white mt-1">
                    {sermonToPreview.title}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSermonToPreview(null)}
                className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                title="إغلاق"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-5">
              {/* Audio Player if available */}
              {sermonToPreview.audioFilePath && (
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-gray-700 dark:text-gray-300">
                    <span className="flex items-center gap-1.5">
                      <AudioIcon className="w-4 h-4 text-blue-600" />
                      <span>التسجيل الصوتي للخطبة</span>
                    </span>
                  </div>
                  <audio
                    controls
                    src={getMediaUrl(sermonToPreview.audioFilePath)!}
                    className="w-full mt-2"
                  >
                    متصفحك لا يدعم تشغيل هذا الملف الصوتي.
                  </audio>
                </div>
              )}

              {/* Description */}
              <div className="p-4 rounded-xl bg-gray-50/70 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
                <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5">
                  الوصف والتفاصيل:
                </h4>
                <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
                  {sermonToPreview.description || "لا يوجد وصف مدخل لهذه الخطبة."}
                </p>
              </div>

              {/* Metadata Stats */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                  <span className="text-gray-400 block mb-0.5">تاريخ إلقاء الخطبة:</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200">
                    {formatDate(sermonToPreview.khutbahDate)}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                  <span className="text-gray-400 block mb-0.5">التصنيف:</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200 truncate block">
                    {sermonToPreview.categoryName}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
              <Link
                href={`/admin/sermons/${sermonToPreview.id}`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-700 dark:text-brand-400"
              >
                <span>فتح صفحة التفاصيل الكاملة ←</span>
              </Link>

              <div className="flex items-center gap-2">
                <Link
                  href={`/admin/sermons/${sermonToPreview.id}/edit`}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 transition-colors"
                >
                  تعديل
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    const toDelete = sermonToPreview;
                    setSermonToPreview(null);
                    setSermonToDelete(toDelete);
                  }}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 transition-colors cursor-pointer"
                >
                  حذف
                </button>
                <button
                  type="button"
                  onClick={() => setSermonToPreview(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
