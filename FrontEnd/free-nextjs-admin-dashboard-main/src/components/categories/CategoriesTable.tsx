"use client";

import React, { useState, useTransition, useRef, useEffect } from "react";
import Link from "next/link";
import {
  deleteCategoryAction,
  getCategoriesAction,
} from "@/actions/admin/categories";
import {
  FolderIcon,
  TrashBinIcon,
  PencilIcon,
  CloseIcon,
  ChevronDownIcon,
  ChevronUpIcon,
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

export interface ChildCategoryItem {
  id: number;
  name: string;
  type: number;
  parentId: number | null;
}

export interface CategoryItem {
  id: number;
  name: string;
  type: number;
  parentId: number | null;
  children?: ChildCategoryItem[];
}

interface CategoriesTableProps {
  initialCategories: CategoryItem[];
  initialTotalCount?: number;
  initialPage?: number;
  initialPageSize?: number;
  initialType?: string;
  initialSearch?: string;
}

export default function CategoriesTable({
  initialCategories,
  initialTotalCount,
  initialPage = 1,
  initialPageSize = 10,
  initialType = "all",
  initialSearch = "",
}: CategoriesTableProps) {
  const [categories, setCategories] =
    useState<CategoryItem[]>(initialCategories);
  const [totalCount, setTotalCount] = useState<number>(
    initialTotalCount ?? initialCategories.length
  );
  const [searchName, setSearchName] = useState(initialSearch);
  const [selectedType, setSelectedType] = useState<string>(initialType);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [itemsPerPage, setItemsPerPage] = useState(initialPageSize);
  const [isFetching, setIsFetching] = useState(false);
  const isInitialMount = useRef(true);

  // Expanded subcategories per category ID
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});

  // Subcategory modal state for viewing full list of children
  const [activeChildrenCategory, setActiveChildrenCategory] =
    useState<CategoryItem | null>(null);

  // Delete modal state
  const [categoryToDelete, setCategoryToDelete] =
    useState<CategoryItem | ChildCategoryItem | null>(null);
  const [isDeleting, startDeleteTransition] = useTransition();
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Category Types map & options
  const categoryTypeOptions = [
    { label: "كل الأنواع", value: "all" },
    { label: "كتب ومؤلفات", value: "1" },
    { label: "دروس ومحاضرات", value: "2" },
    { label: "خطب الجمعة", value: "3" },
    { label: "تلاوات وقرآن", value: "4" },
  ];

  // Helper for Category Type badge
  const getCategoryTypeBadge = (type: number) => {
    switch (type) {
      case 1:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#3F4A2B]/15 text-[#3F4A2B] border border-[#3F4A2B]/30 dark:bg-[#3F4A2B]/25 dark:text-[#DFE5D7]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3F4A2B]"></span>
            <span>كتب ومؤلفات</span>
          </span>
        );
      case 2:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
            <span>دروس ومحاضرات</span>
          </span>
        );
      case 3:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#C0673F]/15 text-[#C0673F] border border-[#C0673F]/30 dark:bg-[#C0673F]/25 dark:text-[#EBC7B3]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C0673F]"></span>
            <span>خطب الجمعة</span>
          </span>
        );
      case 4:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
            <span>تلاوات وقرآن</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200 dark:bg-white/10 dark:text-gray-300">
            نوع ({type})
          </span>
        );
    }
  };

  // Fetch categories directly from the API endpoint
  const fetchCategories = async (
    page: number,
    pageSize: number,
    typeVal: string,
    nameVal: string
  ) => {
    setIsFetching(true);
    try {
      const typeNum =
        typeVal !== "all" && Number(typeVal) > 0 ? Number(typeVal) : null;
      const nameParam = nameVal.trim() ? nameVal.trim() : null;

      const res = await getCategoriesAction(page, pageSize, typeNum, nameParam);

      if (res?.data?.items && Array.isArray(res.data.items)) {
        setCategories(res.data.items);
        setTotalCount(res.data.totalCount ?? res.data.items.length);
      } else if (res?.data && Array.isArray(res.data)) {
        setCategories(res.data);
        setTotalCount(res.data.length);
      } else {
        setCategories([]);
        setTotalCount(0);
      }
      setCurrentPage(page);

      // Sync URL query params without full reload
      if (typeof window !== "undefined") {
        const params = new URLSearchParams();
        if (page > 1) params.set("page", String(page));
        if (pageSize !== 10) params.set("pageSize", String(pageSize));
        if (typeVal !== "all") params.set("type", typeVal);
        if (nameVal.trim()) params.set("name", nameVal.trim());
        const qs = params.toString();
        window.history.replaceState(
          null,
          "",
          qs ? `?${qs}` : window.location.pathname
        );
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const timer = setTimeout(() => {
      fetchCategories(1, itemsPerPage, selectedType, searchName);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchName]);

  const handleFilterChange = (key: string, value: string) => {
    if (key === "name") {
      setSearchName(value);
    } else if (key === "type") {
      setSelectedType(value);
      fetchCategories(1, itemsPerPage, value, searchName);
    }
  };

  const handleResetFilters = () => {
    setSearchName("");
    setSelectedType("all");
    fetchCategories(1, itemsPerPage, "all", "");
  };

  const handlePageChange = (page: number) => {
    fetchCategories(page, itemsPerPage, selectedType, searchName);
  };

  const handlePageSizeChange = (newSize: number) => {
    setItemsPerPage(newSize);
    fetchCategories(1, newSize, selectedType, searchName);
  };

  // Toggle child rows visibility
  const toggleRowExpanded = (categoryId: number) => {
    setExpandedRows((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  // Delete Category Execution
  const handleConfirmDelete = () => {
    if (!categoryToDelete) return;

    startDeleteTransition(async () => {
      const res = await deleteCategoryAction(categoryToDelete.id);

      if (res.success) {
        // If it was a child category, remove it from parent's children
        if (categoryToDelete.parentId) {
          setCategories((prev) =>
            prev.map((c) =>
              c.id === categoryToDelete.parentId
                ? {
                  ...c,
                  children: c.children?.filter(
                    (ch) => ch.id !== categoryToDelete.id
                  ),
                }
                : c
            )
          );
        } else {
          // If it was a root category, remove from list and decrement total
          setCategories((prev) =>
            prev.filter((c) => c.id !== categoryToDelete.id)
          );
          setTotalCount((prev) => Math.max(0, prev - 1));
        }

        setFeedback({
          type: "success",
          message: res.message || "تم حذف التصنيف بنجاح",
        });
        setCategoryToDelete(null);
      } else {
        setFeedback({
          type: "error",
          message: res.message || "فشل حذف التصنيف",
        });
        setCategoryToDelete(null);
      }

      setTimeout(() => {
        setFeedback(null);
      }, 5000);
    });
  };

  // Reusable Filter fields configuration
  const filterFields: FilterField[] = [
    {
      key: "name",
      label: "البحث بالاسم",
      type: "search",
      placeholder: "ابحث باسم التصنيف...",
    },
    {
      key: "type",
      label: "نوع التصنيف",
      type: "select",
      options: categoryTypeOptions,
    },
  ];

  const columns: ColumnDef<CategoryItem>[] = [
    {
      header: "المعرف",
      accessor: (cat) => (
        <span className="font-mono text-xs font-semibold text-gray-500 dark:text-gray-400">
          #{cat.id}
        </span>
      ),
    },
    {
      header: "اسم التصنيف",
      render: (cat) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#3F4A2B]/10 dark:bg-[#3F4A2B]/20 text-[#3F4A2B] dark:text-[#DFE5D7] flex items-center justify-center shrink-0 border border-[#3F4A2B]/20 shadow-2xs">
            <FolderIcon className="w-5 h-5 fill-current" />
          </div>
          <div>
            <p className="font-bold text-gray-900 dark:text-white text-sm">
              {cat.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {cat.parentId ? `تصنيف فرعي` : `تصنيف رئيسي`}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: "النوع",
      render: (cat) => getCategoryTypeBadge(cat.type),
    },
    {
      header: "التصنيفات الفرعية",
      render: (cat) => {
        const hasChildren = cat.children && cat.children.length > 0;
        const count = cat.children?.length || 0;

        if (!hasChildren) {
          return (
            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
              بدون فروع
            </span>
          );
        }

        const isExpanded = !!expandedRows[cat.id];

        return (
          <div className="flex flex-col gap-1.5 items-start">
            <button
              type="button"
              onClick={() => toggleRowExpanded(cat.id)}
              className={`group inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${isExpanded
                  ? "bg-[#3F4A2B] text-white border border-[#3F4A2B] shadow-xs"
                  : "bg-[#3F4A2B]/10 hover:bg-[#3F4A2B]/15 text-[#3F4A2B] border border-[#3F4A2B]/20 dark:bg-[#3F4A2B]/20 dark:text-[#DFE5D7] dark:border-[#3F4A2B]/40 dark:hover:bg-[#3F4A2B]/30 shadow-2xs"
                }`}
            >
              <span
                className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-bold transition-colors ${isExpanded
                    ? "bg-white/20 text-white"
                    : "bg-[#3F4A2B] text-white dark:bg-[#DFE5D7] dark:text-[#3F4A2B]"
                  }`}
              >
                {count}
              </span>
              <span>{count === 1 ? "تصنيف فرعي" : "تصنيفات فرعية"}</span>
              <ChevronDownIcon
                className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded
                    ? "rotate-180 text-white"
                    : "text-[#3F4A2B] dark:text-[#DFE5D7]"
                  }`}
              />
            </button>

            {/* Enhanced Nested Subcategories Card */}
            {isExpanded && (
              <div className="mt-2 flex flex-col w-full min-w-[260px] max-w-sm rounded-xl border border-gray-200/90 bg-white/95 p-2 shadow-xs dark:border-gray-700/80 dark:bg-gray-800/95 backdrop-blur-xs animate-in fade-in slide-in-from-top-1 duration-200">
                <div className="flex items-center justify-between px-2 py-1 mb-1.5 border-b border-gray-100 dark:border-gray-700/60 text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#3F4A2B]"></span>
                    <span>الفروع التابعة ({count})</span>
                  </span>
                  <span className="text-[10px] text-gray-400">إجراءات</span>
                </div>

                <div className="flex flex-col gap-1.5 max-h-52 overflow-y-auto pe-1">
                  {cat.children!.map((child) => (
                    <div
                      key={child.id}
                      className="group flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-gray-50/80 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-700/50 hover:bg-gray-100/80 dark:hover:bg-gray-800/80 hover:border-[#3F4A2B]/30 transition-all"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-mono text-[10px] font-bold text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-800 px-1.5 py-0.5 rounded border border-gray-200/60 dark:border-gray-700 shrink-0">
                          #{child.id}
                        </span>
                        <span
                          className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate"
                          title={child.name}
                        >
                          {child.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <Link
                          href={`/admin/categories/${child.id}/edit`}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-blue-600 bg-blue-50/80 hover:bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 transition-colors"
                          title="تعديل هذا الفرع"
                        >
                          <PencilIcon className="w-3.5 h-3.5 fill-current" />
                        </Link>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCategoryToDelete(child);
                          }}
                          className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-red-600 bg-red-50/80 hover:bg-red-100 dark:text-red-400 dark:bg-red-900/30 dark:hover:bg-red-900/50 transition-colors cursor-pointer"
                          title="حذف هذا الفرع"
                        >
                          <TrashBinIcon className="w-3.5 h-3.5 fill-current" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      },
    },
    {
      header: "الإجراءات",
      align: "center",
      render: (cat) => (
        <div className="inline-flex items-center gap-2">
          {/* View Details/Children Button */}
          {cat.children && cat.children.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveChildrenCategory(cat)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-purple-200 bg-purple-50 text-purple-600 hover:bg-purple-100 dark:bg-purple-900/20 dark:border-purple-800 dark:text-purple-400 text-xs font-semibold transition-colors cursor-pointer"
              title="عرض كل الفروع بالتفصيل"
            >
              <FolderIcon className="w-3.5 h-3.5 fill-current" />
              <span>الفروع ({cat.children.length})</span>
            </button>
          )}

          {/* Edit Button */}
          <Link
            href={`/admin/categories/${cat.id}/edit`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400 text-xs font-semibold transition-colors cursor-pointer"
          >
            <PencilIcon className="w-3.5 h-3.5 fill-current" />
            <span>تعديل</span>
          </Link>

          {/* Delete Button */}
          <button
            type="button"
            onClick={() => setCategoryToDelete(cat)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400 text-xs font-semibold transition-colors cursor-pointer"
          >
            <TrashBinIcon className="w-3.5 h-3.5 fill-current" />
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
        title="تصفية وبحث التصنيفات"
        fields={filterFields}
        values={{
          name: searchName,
          type: selectedType,
        }}
        totalCount={totalCount}
        itemUnitName="تصنيف"
        isFetching={isFetching}
        onChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {/* Categories DataTable */}
      <DataTable<CategoryItem>
        title="قائمة التصنيفات"
        totalCount={totalCount}
        createButton={{
          label: "إضافة تصنيف جديد",
          href: "/admin/categories/create",
        }}
        isFetching={isFetching}
        columns={columns}
        data={categories}
        emptyMessage="لا توجد أي تصنيفات مطابقة لمعايير البحث"
        getRowKey={(cat) => cat.id}
        pagination={
          <DataTablePagination
            currentPage={currentPage}
            totalCount={totalCount}
            pageSize={itemsPerPage}
            pageSizeOptions={[3, 5, 10, 20, 50]}
            isFetching={isFetching}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        }
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!categoryToDelete}
        title="تأكيد حذف التصنيف"
        itemName={categoryToDelete?.name}
        itemId={categoryToDelete?.id}
        message={
          categoryToDelete &&
            "children" in categoryToDelete &&
            categoryToDelete.children &&
            categoryToDelete.children.length > 0
            ? `تنبيه: هذا التصنيف يحتوي على (${categoryToDelete.children.length}) تصنيفات فرعية. هل أنت متأكد من حذفه؟`
            : undefined
        }
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setCategoryToDelete(null)}
      />

      {/* Subcategories Detail Modal */}
      {activeChildrenCategory && (
        <div className="fixed inset-0 z-99999 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900 border border-gray-100 dark:border-gray-800 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#3F4A2B]/10 text-[#3F4A2B] flex items-center justify-center shrink-0">
                  <FolderIcon className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    التصنيفات الفرعية لـ "{activeChildrenCategory.name}"
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    المعرف: #{activeChildrenCategory.id} | الإجمالي:{" "}
                    {activeChildrenCategory.children?.length || 0}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveChildrenCategory(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 cursor-pointer"
              >
                <CloseIcon className="w-5 h-5 fill-current" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto space-y-2 py-1">
              {activeChildrenCategory.children &&
                activeChildrenCategory.children.length > 0 ? (
                activeChildrenCategory.children.map((child, index) => (
                  <div
                    key={child.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700/60"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-lg bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-300 text-xs font-semibold flex items-center justify-center border border-gray-200 dark:border-gray-600">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-semibold text-sm text-gray-900 dark:text-white">
                          {child.name}
                        </p>
                        <p className="text-[11px] font-mono text-gray-400">
                          #{child.id}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Link
                        href={`/admin/categories/${child.id}/edit`}
                        className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors cursor-pointer"
                        title="تعديل هذا التصنيف الفرعي"
                      >
                        <PencilIcon className="w-4 h-4 fill-current" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveChildrenCategory(null);
                          setCategoryToDelete(child);
                        }}
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                        title="حذف هذا التصنيف الفرعي"
                      >
                        <TrashBinIcon className="w-4 h-4 fill-current" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-sm text-gray-500 py-6">
                  لا توجد تصنيفات فرعية
                </p>
              )}
            </div>

            <div className="flex justify-end pt-4 mt-3 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={() => setActiveChildrenCategory(null)}
                className="px-4 py-2 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 cursor-pointer"
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
