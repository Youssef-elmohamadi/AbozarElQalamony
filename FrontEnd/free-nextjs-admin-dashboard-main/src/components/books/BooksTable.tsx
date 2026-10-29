"use client";

import React, { useState, useTransition, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { deleteBookAction, getBooksAction } from "@/actions/admin/books";
import { getAllCategoriesAction } from "@/actions/admin/categories";
import {
  FolderIcon,
  TrashBinIcon,
  CloseIcon,
  FileIcon,
  DocsIcon,
  DownloadIcon,
  UserIcon,
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

export interface BookItem {
  id: number;
  title: string;
  authorName: string;
  description?: string | null;
  pdfFilePath?: string | null;
  coverImagePath?: string | null;
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

interface BooksTableProps {
  initialBooks: BookItem[];
  initialTotalCount?: number;
  initialPage?: number;
  initialPageSize?: number;
  initialCategoryId?: string;
  initialSearch?: string;
  initialCategories?: CategoryOption[];
}

export default function BooksTable({
  initialBooks,
  initialTotalCount,
  initialPage = 1,
  initialPageSize = 10,
  initialCategoryId = "all",
  initialSearch = "",
  initialCategories = [],
}: BooksTableProps) {
  const [books, setBooks] = useState<BookItem[]>(initialBooks);
  const [totalCount, setTotalCount] = useState<number>(
    initialTotalCount ?? initialBooks.length
  );
  const [searchTitle, setSearchTitle] = useState(initialSearch);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(initialCategoryId);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [itemsPerPage, setItemsPerPage] = useState(initialPageSize);
  const [isFetching, setIsFetching] = useState(false);
  const [categoriesList, setCategoriesList] = useState<CategoryOption[]>(initialCategories);
  const isInitialMount = useRef(true);

  // Modals state
  const [bookToDelete, setBookToDelete] = useState<BookItem | null>(null);
  const [bookToPreview, setBookToPreview] = useState<BookItem | null>(null);
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

  // Load book categories if not preloaded
  // Load book categories if not preloaded
  useEffect(() => {
    if (categoriesList.length === 0) {
      getAllCategoriesAction(1) // 1 = Book categories
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

    // Also include any categories present in current books if missing from categoriesList
    books.forEach((b) => {
      if (b.categoryId && !seenCategoryIds.has(b.categoryId)) {
        seenCategoryIds.add(b.categoryId);
        standaloneOptions.push({
          label: b.categoryName || `تصنيف ${b.categoryId}`,
          value: String(b.categoryId),
        });
      }
    });

    return [
      { label: "جميع التصنيفات", value: "all" },
      ...standaloneOptions,
      ...groupedOptions,
    ];
  }, [categoriesList, books]);

  // Fetch books with pagination & filters
  const fetchBooks = async (
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

      const res = await getBooksAction(
        page,
        pageSize,
        categoryIdNum,
        null,
        searchParam,
        searchParam
      );

      if (res?.data?.items && Array.isArray(res.data.items)) {
        setBooks(res.data.items);
        setTotalCount(res.data.totalCount ?? res.data.items.length);
      } else if (res?.data && Array.isArray(res.data)) {
        setBooks(res.data);
        setTotalCount(res.data.length);
      } else {
        setBooks([]);
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
      console.error("Error fetching books:", err);
    } finally {
      setIsFetching(false);
    }
  };

  // Debounced search on typing book title
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const timer = setTimeout(() => {
      fetchBooks(1, itemsPerPage, selectedCategoryId, searchTitle);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTitle]);

  // Handlers for filter changes
  const handleFilterChange = (key: string, value: string) => {
    if (key === "search") {
      setSearchTitle(value);
    } else if (key === "categoryId") {
      setSelectedCategoryId(value);
      fetchBooks(1, itemsPerPage, value, searchTitle);
    }
  };

  const handleResetFilters = () => {
    setSearchTitle("");
    setSelectedCategoryId("all");
    fetchBooks(1, itemsPerPage, "all", "");
  };

  const handlePageChange = (newPage: number) => {
    fetchBooks(newPage, itemsPerPage, selectedCategoryId, searchTitle);
  };

  const handlePageSizeChange = (newSize: number) => {
    setItemsPerPage(newSize);
    fetchBooks(1, newSize, selectedCategoryId, searchTitle);
  };

  // Handle Delete Confirmation
  const confirmDelete = () => {
    if (!bookToDelete) return;

    startDeleteTransition(async () => {
      try {
        const res = await deleteBookAction(bookToDelete.id);
        if (res.success) {
          setFeedback({ type: "success", message: res.message });
          setBookToDelete(null);
          const targetPage =
            books.length === 1 && currentPage > 1
              ? currentPage - 1
              : currentPage;
          fetchBooks(targetPage, itemsPerPage, selectedCategoryId, searchTitle);
        } else {
          setFeedback({ type: "error", message: res.message });
        }
      } catch (err: any) {
        setFeedback({
          type: "error",
          message: err?.message || "حدث خطأ أثناء محاولة حذف الكتاب",
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
      label: "البحث باسم الكتاب أو المؤلف",
      type: "search",
      placeholder: "اكتب اسم الكتاب أو اسم المؤلف للبحث...",
    },
    {
      key: "categoryId",
      label: "التصنيف",
      type: "select",
      options: categoryOptions,
    },
  ];

  // Table Columns Definition
  const columns: ColumnDef<BookItem>[] = [
    {
      header: "المعرف",
      accessor: (book) => (
        <span className="font-mono text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md border border-gray-200 dark:border-gray-700">
          #{book.id}
        </span>
      ),
    },
    {
      header: "الكتاب",
      render: (book) => {
        const coverUrl = getMediaUrl(book.coverImagePath);
        return (
          <div className="flex items-center gap-3.5 py-1 min-w-[240px]">
            {/* Cover / Icon container */}
            <div className="relative w-11 h-14 rounded-lg overflow-hidden bg-gradient-to-br from-[#3F4A2B]/15 to-[#3F4A2B]/5 dark:from-[#3F4A2B]/30 dark:to-[#3F4A2B]/10 border border-[#3F4A2B]/20 shrink-0 flex items-center justify-center shadow-2xs">
              {coverUrl ? (
                <img
                  src={coverUrl}
                  alt={book.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              ) : (
                <DocsIcon className="w-5 h-5 text-[#3F4A2B] dark:text-[#DFE5D7]" />
              )}
            </div>

            <div className="flex flex-col min-w-0">
              <h4
                className="font-bold text-gray-900 dark:text-white text-sm line-clamp-1 hover:text-[#3F4A2B] dark:hover:text-[#DFE5D7] transition-colors cursor-pointer"
                onClick={() => setBookToPreview(book)}
                title={book.title}
              >
                {book.title}
              </h4>
              {book.description && (
                <p
                  className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1"
                  title={book.description}
                >
                  {book.description}
                </p>
              )}
            </div>
          </div>
        );
      },
    },
    {
      header: "المؤلف",
      render: (book) => (
        <div className="flex items-center gap-1.5 text-xs text-gray-700 dark:text-gray-300">
          <UserIcon className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <span className="font-medium">{book.authorName || "فضيلة الشيخ أبو ذر القلموني"}</span>
        </div>
      ),
    },
    {
      header: "التصنيف",
      render: (book) => (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-[#3F4A2B]/10 text-[#3F4A2B] dark:bg-[#3F4A2B]/20 dark:text-[#DFE5D7] border border-[#3F4A2B]/20">
          <FolderIcon className="w-3.5 h-3.5 fill-current" />
          <span>{book.categoryName || "بدون تصنيف"}</span>
        </span>
      ),
    },
    {
      header: "ملف الكتاب",
      render: (book) => {
        const pdfUrl = getMediaUrl(book.pdfFilePath);
        return (
          <div>
            {pdfUrl ? (
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors"
                title="تحميل أو قراءة ملف PDF"
              >
                <FileIcon className="w-3.5 h-3.5 fill-current" />
                <span>PDF متاح</span>
                <DownloadIcon className="w-3 h-3 text-rose-500" />
              </a>
            ) : (
              <span className="text-xs text-gray-400 dark:text-gray-500">
                لا يوجد ملف PDF
              </span>
            )}
          </div>
        );
      },
    },
    {
      header: "تاريخ النشر",
      render: (book) => (
        <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
          <CalenderIcon className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <span>{formatDate(book.publishDate || book.createdAt)}</span>
        </div>
      ),
    },
    {
      header: "الإجراءات",
      align: "center",
      headerClassName: "w-[240px] min-w-[240px] text-center whitespace-nowrap",
      className: "w-[240px] min-w-[240px] text-center whitespace-nowrap",
      render: (book) => (
        <div className="inline-flex items-center justify-center gap-2 whitespace-nowrap">
          {/* Quick Preview Button */}
          <button
            type="button"
            onClick={() => setBookToPreview(book)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0"
            title="معاينة تفاصيل الكتاب"
          >
            <EyeIcon className="w-3.5 h-3.5 shrink-0" />
            <span>معاينة</span>
          </button>

          {/* Edit Button */}
          <Link
            href={`/admin/books/${book.id}/edit`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0"
            title="تعديل هذا الكتاب"
          >
            <PencilIcon className="w-3.5 h-3.5 fill-current shrink-0" />
            <span>تعديل</span>
          </Link>

          {/* Delete Button */}
          <button
            type="button"
            onClick={() => setBookToDelete(book)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0"
            title="حذف هذا الكتاب"
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
        title="تصفية وبحث الكتب"
        fields={filterFields}
        values={{
          search: searchTitle,
          categoryId: selectedCategoryId,
        }}
        totalCount={totalCount}
        itemUnitName="كتاب"
        isFetching={isFetching}
        onChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {/* Books Data Table */}
      <DataTable<BookItem>
        title="قائمة الكتب والمؤلفات"
        totalCount={totalCount}
        createButton={{
          label: "إضافة كتاب جديد",
          href: "/admin/books/create",
        }}
        isFetching={isFetching}
        columns={columns}
        data={books}
        emptyMessage="لم يتم العثور على أي كتب مطابقة لمعايير البحث والتصنيف المحددة."
        getRowKey={(book) => book.id}
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
        isOpen={!!bookToDelete}
        title="تأكيد حذف الكتاب"
        itemName={bookToDelete?.title}
        itemId={bookToDelete?.id}
        message={`هل أنت متأكد من رغبتك في حذف الكتاب "${bookToDelete?.title}" نهائياً من النظام؟ لا يمكن التراجع عن هذا الإجراء.`}
        isDeleting={isDeleting}
        onConfirm={confirmDelete}
        onClose={() => setBookToDelete(null)}
      />

      {/* Preview Modal */}
      {bookToPreview && (
        <div className="fixed inset-0 z-99999 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-gray-100 dark:border-gray-800 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 flex items-center justify-center shrink-0 border border-amber-200 dark:border-amber-800/40">
                  <DocsIcon className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                      #{bookToPreview.id}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-[#3F4A2B]/10 text-[#3F4A2B] dark:text-[#DFE5D7]">
                      <FolderIcon className="w-3 h-3 fill-current" />
                      <span>{bookToPreview.categoryName}</span>
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white mt-1">
                    {bookToPreview.title}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setBookToPreview(null)}
                className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                title="إغلاق"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="space-y-5">
              <div className="flex items-start gap-4">
                {bookToPreview.coverImagePath && (
                  <img
                    src={getMediaUrl(bookToPreview.coverImagePath) || undefined}
                    alt={bookToPreview.title}
                    className="w-24 h-32 object-cover rounded-xl shadow-md border border-gray-200 dark:border-gray-700 shrink-0"
                  />
                )}
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {bookToPreview.title}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    المؤلف: {bookToPreview.authorName || "فضيلة الشيخ أبو ذر القلموني"}
                  </p>
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-[#3F4A2B]/10 text-[#3F4A2B] dark:bg-[#3F4A2B]/20 dark:text-[#DFE5D7] border border-[#3F4A2B]/20">
                      <FolderIcon className="w-3.5 h-3.5 fill-current" />
                      <span>{bookToPreview.categoryName}</span>
                    </span>
                    {bookToPreview.publishDate && (
                      <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-lg border border-gray-200 dark:border-gray-700">
                        <CalenderIcon className="w-3.5 h-3.5" />
                        <span>تاريخ النشر: {formatDate(bookToPreview.publishDate)}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {bookToPreview.description && (
                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                  <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                    نبذة عن الكتاب:
                  </h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {bookToPreview.description}
                  </p>
                </div>
              )}

              {/* PDF File action */}
              {bookToPreview.pdfFilePath ? (
                <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/40 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <FileIcon className="w-6 h-6 text-rose-600 dark:text-rose-400" />
                    <div>
                      <h4 className="text-sm font-semibold text-rose-900 dark:text-rose-200">
                        ملف الكتاب الإلكتروني (PDF)
                      </h4>
                      <p className="text-xs text-rose-600 dark:text-rose-400">
                        متاح للتصفح والتحميل المباشر
                      </p>
                    </div>
                  </div>
                  <a
                    href={getMediaUrl(bookToPreview.pdfFilePath) || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors inline-flex items-center gap-1.5"
                  >
                    <DownloadIcon className="w-3.5 h-3.5" />
                    <span>فتح / تحميل PDF</span>
                  </a>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-xs text-gray-400 text-center">
                  لم يتم رفع ملف PDF لهذا الكتاب حتى الآن.
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
              <Link
                href={`/admin/books/${bookToPreview.id}`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-700 dark:text-brand-400"
              >
                <span>فتح صفحة التفاصيل الكاملة ←</span>
              </Link>

              <div className="flex items-center gap-2">
                <Link
                  href={`/admin/books/${bookToPreview.id}/edit`}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 transition-colors"
                >
                  تعديل
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    const toDelete = bookToPreview;
                    setBookToPreview(null);
                    setBookToDelete(toDelete);
                  }}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 transition-colors cursor-pointer"
                >
                  حذف
                </button>
                <button
                  type="button"
                  onClick={() => setBookToPreview(null)}
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
