"use client";

import React, { useState, useTransition, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { deleteLessonAction, getLessonsAction } from "@/actions/admin/lessons";
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

export interface LessonItem {
  id: number;
  title: string;
  description?: string | null;
  audioFilePath?: string | null;
  videoFilePath?: string | null;
  thumbnailPath?: string | null;
  durationInMinutes?: number | null;
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

interface LessonsTableProps {
  initialLessons: LessonItem[];
  initialTotalCount?: number;
  initialPage?: number;
  initialPageSize?: number;
  initialCategoryId?: string;
  initialSearch?: string;
  initialCategories?: CategoryOption[];
}

export default function LessonsTable({
  initialLessons,
  initialTotalCount,
  initialPage = 1,
  initialPageSize = 10,
  initialCategoryId = "all",
  initialSearch = "",
  initialCategories = [],
}: LessonsTableProps) {
  const [lessons, setLessons] = useState<LessonItem[]>(initialLessons);
  const [totalCount, setTotalCount] = useState<number>(
    initialTotalCount ?? initialLessons.length
  );
  const [searchTitle, setSearchTitle] = useState(initialSearch);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(initialCategoryId);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [itemsPerPage, setItemsPerPage] = useState(initialPageSize);
  const [isFetching, setIsFetching] = useState(false);
  const [categoriesList, setCategoriesList] = useState<CategoryOption[]>(initialCategories);
  const isInitialMount = useRef(true);

  // Modals state
  const [lessonToDelete, setLessonToDelete] = useState<LessonItem | null>(null);
  const [lessonToPreview, setLessonToPreview] = useState<LessonItem | null>(null);
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

  // Populate categories if not passed initially
  useEffect(() => {
    if (categoriesList.length === 0) {
      getAllCategoriesAction(2)
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            setCategoriesList(
              data.map((c: any) => ({
                id: c.id,
                name: c.name,
                parentId: c.parentId ?? null,
              }))
            );
          }
        })
        .catch(() => { });
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
        // Parent category acts as a group header, not a direct item category
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

    // Also include any categories present in current lessons if missing from categoriesList
    lessons.forEach((l) => {
      if (l.categoryId && !seenCategoryIds.has(l.categoryId)) {
        seenCategoryIds.add(l.categoryId);
        standaloneOptions.push({
          label: l.categoryName || `تصنيف ${l.categoryId}`,
          value: String(l.categoryId),
        });
      }
    });

    return [
      { label: "جميع التصنيفات", value: "all" },
      ...standaloneOptions,
      ...groupedOptions,
    ];
  }, [categoriesList, lessons]);

  // Fetch lessons with pagination & filters
  const fetchLessons = async (
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

      const res = await getLessonsAction(
        page,
        pageSize,
        categoryIdNum,
        null, // categoryName
        searchParam, // title/name
        searchParam // search
      );

      if (res?.data?.items && Array.isArray(res.data.items)) {
        setLessons(res.data.items);
        setTotalCount(res.data.totalCount ?? res.data.items.length);
      } else if (res?.data && Array.isArray(res.data)) {
        setLessons(res.data);
        setTotalCount(res.data.length);
      } else {
        setLessons([]);
        setTotalCount(0);
      }
      setCurrentPage(page);

      // Sync URL query params without page reload
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
      console.error("Error fetching lessons:", err);
    } finally {
      setIsFetching(false);
    }
  };

  // Debounced search on typing lesson title
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const timer = setTimeout(() => {
      fetchLessons(1, itemsPerPage, selectedCategoryId, searchTitle);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTitle]);

  // Handlers for filter changes
  const handleFilterChange = (key: string, value: string) => {
    if (key === "search") {
      setSearchTitle(value);
    } else if (key === "categoryId") {
      setSelectedCategoryId(value);
      fetchLessons(1, itemsPerPage, value, searchTitle);
    }
  };

  const handleResetFilters = () => {
    setSearchTitle("");
    setSelectedCategoryId("all");
    fetchLessons(1, itemsPerPage, "all", "");
  };

  const handlePageChange = (newPage: number) => {
    fetchLessons(newPage, itemsPerPage, selectedCategoryId, searchTitle);
  };

  const handlePageSizeChange = (newSize: number) => {
    setItemsPerPage(newSize);
    fetchLessons(1, newSize, selectedCategoryId, searchTitle);
  };

  // Handle Delete Confirmation (calls DELETE /api/admin/lessons/{id})
  const confirmDelete = () => {
    if (!lessonToDelete) return;

    startDeleteTransition(async () => {
      try {
        const res = await deleteLessonAction(lessonToDelete.id);
        if (res.success) {
          setFeedback({ type: "success", message: res.message });
          setLessonToDelete(null);
          const targetPage =
            lessons.length === 1 && currentPage > 1
              ? currentPage - 1
              : currentPage;
          fetchLessons(targetPage, itemsPerPage, selectedCategoryId, searchTitle);
        } else {
          setFeedback({ type: "error", message: res.message });
        }
      } catch (err: any) {
        setFeedback({
          type: "error",
          message: err?.message || "حدث خطأ أثناء محاولة حذف الدرس",
        });
      }

      setTimeout(() => {
        setFeedback(null);
      }, 5000);
    });
  };

  // Filter fields configuration for DataTableFilter
  const filterFields: FilterField[] = [
    {
      key: "search",
      label: "البحث باسم الدرس",
      type: "search",
      placeholder: "اكتب اسم الدرس للبحث...",
    },
    {
      key: "categoryId",
      label: "التصنيف",
      type: "select",
      options: categoryOptions,
    },
  ];

  // Table Columns Definition
  const columns: ColumnDef<LessonItem>[] = [
    {
      header: "المعرف",
      accessor: (lesson) => (
        <span className="font-mono text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md border border-gray-200 dark:border-gray-700">
          #{lesson.id}
        </span>
      ),
    },
    {
      header: "الدرس",
      render: (lesson) => {
        const thumbUrl = getMediaUrl(lesson.thumbnailPath);
        return (
          <div className="flex items-center gap-3.5 py-1 min-w-[240px]">
            {/* Thumbnail / Icon container */}
            <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-br from-[#3F4A2B]/15 to-[#3F4A2B]/5 dark:from-[#3F4A2B]/30 dark:to-[#3F4A2B]/10 border border-[#3F4A2B]/20 shrink-0 flex items-center justify-center shadow-2xs">
              {thumbUrl ? (
                <img
                  src={thumbUrl}
                  alt={lesson.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to icon if thumbnail fails to load
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              ) : lesson.videoFilePath ? (
                <VideoIcon className="w-5 h-5 text-[#3F4A2B] dark:text-[#DFE5D7]" />
              ) : (
                <AudioIcon className="w-5 h-5 text-[#3F4A2B] dark:text-[#DFE5D7]" />
              )}
            </div>

            <div className="flex flex-col min-w-0">
              <h4
                className="font-bold text-gray-900 dark:text-white text-sm line-clamp-1 hover:text-[#3F4A2B] dark:hover:text-[#DFE5D7] transition-colors cursor-pointer"
                onClick={() => setLessonToPreview(lesson)}
                title={lesson.title}
              >
                {lesson.title}
              </h4>
              {lesson.description && (
                <p
                  className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1"
                  title={lesson.description}
                >
                  {lesson.description}
                </p>
              )}
            </div>
          </div>
        );
      },
    },
    {
      header: "التصنيف",
      render: (lesson) => (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-[#3F4A2B]/10 text-[#3F4A2B] dark:bg-[#3F4A2B]/20 dark:text-[#DFE5D7] border border-[#3F4A2B]/20">
          <FolderIcon className="w-3.5 h-3.5 fill-current" />
          <span>{lesson.categoryName || "بدون تصنيف"}</span>
        </span>
      ),
    },
    {
      header: "الوسائط والمدة",
      render: (lesson) => (
        <div className="flex items-center gap-2 flex-wrap">
          {lesson.videoFilePath && (
            <span
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
              title="يحتوي على فيديو"
            >
              <VideoIcon className="w-3 h-3 fill-current" />
              <span>مرئي</span>
            </span>
          )}

          {lesson.audioFilePath && (
            <span
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
              title="يحتوي على ملف صوتي"
            >
              <AudioIcon className="w-3 h-3 fill-current" />
              <span>صوتي</span>
            </span>
          )}

          {lesson.durationInMinutes != null && lesson.durationInMinutes > 0 && (
            <span className="inline-flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/80 px-2 py-0.5 rounded-md border border-gray-200 dark:border-gray-700">
              <TimeIcon className="w-3.5 h-3.5" />
              <span>{lesson.durationInMinutes} دقيقة</span>
            </span>
          )}

          {!lesson.videoFilePath && !lesson.audioFilePath && (
            <span className="text-xs text-gray-400 dark:text-gray-500">
              بدون وسائط
            </span>
          )}
        </div>
      ),
    },
    {
      header: "تاريخ النشر",
      render: (lesson) => (
        <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
          <CalenderIcon className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <span>{formatDate(lesson.publishDate || lesson.createdAt)}</span>
        </div>
      ),
    },
    {
      header: "الإجراءات",
      align: "center",
      headerClassName: "w-[240px] min-w-[240px] text-center whitespace-nowrap",
      className: "w-[240px] min-w-[240px] text-center whitespace-nowrap",
      render: (lesson) => (
        <div className="inline-flex items-center justify-center gap-2 whitespace-nowrap">
          {/* Quick Preview Button */}
          <button
            type="button"
            onClick={() => setLessonToPreview(lesson)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0"
            title="معاينة تفاصيل الدرس وتشغيل الوسائط"
          >
            <EyeIcon className="w-3.5 h-3.5 shrink-0" />
            <span>معاينة</span>
          </button>

          {/* Edit Button */}
          <Link
            href={`/admin/lessons/${lesson.id}/edit`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0"
            title="تعديل هذا الدرس"
          >
            <PencilIcon className="w-3.5 h-3.5 fill-current shrink-0" />
            <span>تعديل</span>
          </Link>

          {/* Delete Button (calls DELETE /api/admin/lessons/{id}) */}
          <button
            type="button"
            onClick={() => setLessonToDelete(lesson)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0"
            title="حذف هذا الدرس"
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

      {/* Filter Card */}
      <DataTableFilter
        title="تصفية وبحث الدروس"
        fields={filterFields}
        values={{
          search: searchTitle,
          categoryId: selectedCategoryId,
        }}
        totalCount={totalCount}
        itemUnitName="درس"
        isFetching={isFetching}
        onChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {/* Lessons DataTable */}
      <DataTable<LessonItem>
        title="قائمة الدروس"
        totalCount={totalCount}
        createButton={{
          label: "إضافة درس جديد",
          href: "/admin/lessons/create",
        }}
        isFetching={isFetching}
        columns={columns}
        data={lessons}
        emptyMessage="لا توجد أي دروس مطابقة لمعايير البحث الحالية"
        getRowKey={(lesson) => lesson.id}
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
        isOpen={!!lessonToDelete}
        title="تأكيد حذف الدرس"
        itemName={lessonToDelete?.title}
        itemId={lessonToDelete?.id}
        message={`هل أنت متأكد من رغبتك في حذف هذا الدرس؟ سيتم حذف جميع الملفات والوسائط المرتبطة به نهائياً من السيرفر.`}
        isDeleting={isDeleting}
        onConfirm={confirmDelete}
        onClose={() => setLessonToDelete(null)}
      />

      {/* Lesson Details / Preview Modal */}
      {lessonToPreview && (
        <div className="fixed inset-0 z-99999 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-gray-100 dark:border-gray-800 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#3F4A2B]/10 text-[#3F4A2B] dark:bg-[#3F4A2B]/25 dark:text-[#DFE5D7] flex items-center justify-center shrink-0 border border-[#3F4A2B]/20">
                  <VideoIcon className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                      #{lessonToPreview.id}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-[#3F4A2B]/10 text-[#3F4A2B] dark:text-[#DFE5D7]">
                      <FolderIcon className="w-3 h-3 fill-current" />
                      <span>{lessonToPreview.categoryName}</span>
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white mt-1">
                    {lessonToPreview.title}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setLessonToPreview(null)}
                className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                title="إغلاق"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-5">
              {/* Video Player if available */}
              {/* {lessonToPreview.videoFilePath && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    <VideoIcon className="w-4 h-4 text-purple-600" />
                    <span>فيديو الدرس</span>
                  </h4>
                  <div className="rounded-xl overflow-hidden bg-black aspect-video shadow-sm border border-gray-200 dark:border-gray-800">
                    <video
                      controls
                      src={getMediaUrl(lessonToPreview.videoFilePath)!}
                      poster={getMediaUrl(lessonToPreview.thumbnailPath) || undefined}
                      className="w-full h-full object-contain"
                    >
                      متصفحك لا يدعم تشغيل هذا الفيديو.
                    </video>
                  </div>
                </div>
              )} */}

              {/* Audio Player if available */}
              {lessonToPreview.audioFilePath && (
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-gray-700 dark:text-gray-300">
                    <span className="flex items-center gap-1.5">
                      <AudioIcon className="w-4 h-4 text-blue-600" />
                      <span>التسجيل الصوتي</span>
                    </span>
                    {lessonToPreview.durationInMinutes && (
                      <span className="text-gray-500">
                        {lessonToPreview.durationInMinutes} دقيقة
                      </span>
                    )}
                  </div>
                  <audio
                    controls
                    src={getMediaUrl(lessonToPreview.audioFilePath)!}
                    className="w-full mt-2"
                  >
                    متصفحك لا يدعم تشغيل هذا الملف الصوتي.
                  </audio>
                </div>
              )}

              {/* Thumbnail preview if no video was shown */}
              {/* {!lessonToPreview.videoFilePath && lessonToPreview.thumbnailPath && (
                <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 max-h-60 bg-gray-100 dark:bg-gray-800">
                  <img
                    src={getMediaUrl(lessonToPreview.thumbnailPath)!}
                    alt={lessonToPreview.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )} */}

              {/* Description */}
              <div className="p-4 rounded-xl bg-gray-50/70 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
                <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5">
                  الوصف والتفاصيل:
                </h4>
                <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
                  {lessonToPreview.description || "لا يوجد وصف مدخل لهذا الدرس."}
                </p>
              </div>

              {/* Metadata Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                  <span className="text-gray-400 block mb-0.5">المدة:</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200">
                    {lessonToPreview.durationInMinutes
                      ? `${lessonToPreview.durationInMinutes} دقيقة`
                      : "غير محددة"}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                  <span className="text-gray-400 block mb-0.5">تاريخ النشر:</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200">
                    {formatDate(lessonToPreview.publishDate || lessonToPreview.createdAt)}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 col-span-2 sm:col-span-1">
                  <span className="text-gray-400 block mb-0.5">التصنيف:</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200 truncate block">
                    {lessonToPreview.categoryName}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
              <Link
                href={`/admin/lessons/${lessonToPreview.id}`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-700 dark:text-brand-400"
              >
                <span>فتح صفحة التفاصيل الكاملة ←</span>
              </Link>

              <div className="flex items-center gap-2">
                <Link
                  href={`/admin/lessons/${lessonToPreview.id}/edit`}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 transition-colors"
                >
                  تعديل
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    const toDelete = lessonToPreview;
                    setLessonToPreview(null);
                    setLessonToDelete(toDelete);
                  }}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 transition-colors cursor-pointer"
                >
                  حذف
                </button>
                <button
                  type="button"
                  onClick={() => setLessonToPreview(null)}
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
