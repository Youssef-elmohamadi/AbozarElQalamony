"use client";

import React, { useState, useTransition, useMemo } from "react";
import { SiteAlertItem } from "@/types/site-alert";
import {
  deleteSiteAlertAction,
  toggleSiteAlertStatusAction,
  getSiteAlertsAction,
} from "@/actions/admin/site-alerts";
import {
  DataTable,
  DataTableFilter,
  DeleteConfirmModal,
  ColumnDef,
  FilterField,
} from "@/components/common/data-table";
import {
  BellIcon,
  PencilIcon,
  TrashBinIcon,
  CheckCircleIcon,
  AlertIcon,
  CloseIcon,
  CalenderIcon,
  PlusIcon,
} from "@/icons";
import SiteAlertModal from "./SiteAlertModal";

interface SiteAlertsTableProps {
  initialAlerts: SiteAlertItem[];
}

export default function SiteAlertsTable({ initialAlerts }: SiteAlertsTableProps) {
  const [alerts, setAlerts] = useState<SiteAlertItem[]>(initialAlerts);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [alertToEdit, setAlertToEdit] = useState<SiteAlertItem | null>(null);
  const [alertToDelete, setAlertToDelete] = useState<SiteAlertItem | null>(null);

  // Transitions
  const [isDeleting, startDeleteTransition] = useTransition();
  const [togglingId, setTogglingId] = useState<number | null>(null);

  // Notification Banner
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const showFeedback = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => {
      setFeedback((prev) => (prev?.message === message ? null : prev));
    }, 4500);
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "—";
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("ar-EG", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } catch {
      return dateString;
    }
  };

  // Filter fields config for DataTableFilter
  const filterFields: FilterField[] = [
    {
      key: "search",
      label: "بحث بالعنوان أو النص",
      type: "search",
      placeholder: "اكتب كلمات للبحث في التنبيهات...",
    },
    {
      key: "status",
      label: "حالة التنبيه",
      type: "select",
      options: [
        { label: "جميع الحالات", value: "all" },
        { label: "تنبيهات نشطة فقط", value: "active" },
        { label: "تنبيهات معطلة فقط", value: "inactive" },
      ],
    },
  ];

  const filterValues = {
    search: searchQuery,
    status: statusFilter,
  };

  const handleFilterChange = (key: string, value: string) => {
    if (key === "search") setSearchQuery(value);
    if (key === "status") setStatusFilter(value);
  };

  const handleFilterReset = () => {
    setSearchQuery("");
    setStatusFilter("all");
  };

  // Filtered alerts list
  const filteredAlerts = useMemo(() => {
    return alerts.filter((item) => {
      // Status match
      if (statusFilter === "active" && !item.isActive) return false;
      if (statusFilter === "inactive" && item.isActive) return false;

      // Search match
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const inTitle = item.title?.toLowerCase().includes(query) ?? false;
        const inContent = item.content?.toLowerCase().includes(query) ?? false;
        if (!inTitle && !inContent) return false;
      }

      return true;
    });
  }, [alerts, searchQuery, statusFilter]);

  // Handle fast status toggle
  const handleToggleStatus = async (alertItem: SiteAlertItem) => {
    setTogglingId(alertItem.id);
    try {
      const res = await toggleSiteAlertStatusAction(alertItem.id, alertItem);
      if (res.success) {
        setAlerts((prev) =>
          prev.map((a) =>
            a.id === alertItem.id ? { ...a, isActive: !a.isActive } : a
          )
        );
        showFeedback("success", res.message);
      } else {
        showFeedback("error", res.message || "فشل تغيير حالة التنبيه");
      }
    } catch (err) {
      showFeedback("error", "حدث خطأ أثناء تغيير الحالة");
    } finally {
      setTogglingId(null);
    }
  };

  // Handle delete confirmation
  const handleConfirmDelete = () => {
    if (!alertToDelete) return;
    const alertId = alertToDelete.id;

    startDeleteTransition(async () => {
      try {
        const res = await deleteSiteAlertAction(alertId);
        if (res.success) {
          setAlerts((prev) => prev.filter((a) => a.id !== alertId));
          setAlertToDelete(null);
          showFeedback("success", "تم حذف التنبيه بنجاح");
        } else {
          showFeedback("error", res.message || "فشل حذف التنبيه");
        }
      } catch (err) {
        showFeedback("error", "حدث خطأ غير متوقع أثناء الحذف");
      }
    });
  };

  // Handle modal save success
  const handleModalSuccess = (savedAlert: SiteAlertItem, isNew: boolean) => {
    if (isNew) {
      setAlerts((prev) => [savedAlert, ...prev]);
      showFeedback("success", "تمت إضافة التنبيه بنجاح");
    } else {
      setAlerts((prev) =>
        prev.map((a) => (a.id === savedAlert.id ? savedAlert : a))
      );
      showFeedback("success", "تم حفظ تعديلات التنبيه بنجاح");
    }
  };

  // Define columns for DataTable
  const columns: ColumnDef<SiteAlertItem>[] = [
    {
      header: "#ID",
      align: "center",
      accessor: (item: SiteAlertItem) => (
        <span className="font-mono text-xs font-semibold px-2 py-1 rounded bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
          #{item.id}
        </span>
      ),
    },
    {
      header: "عنوان التنبيه",
      render: (item: SiteAlertItem) => (
        <div className="flex items-center gap-2.5 min-w-[220px]">
          <div
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
              item.isActive
                ? "bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400"
                : "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500"
            }`}
          >
            <BellIcon className="h-4 w-4 fill-current" />
          </div>
          <span className="font-semibold text-gray-900 dark:text-white line-clamp-2">
            {item.title}
          </span>
        </div>
      ),
    },
    {
      header: "نص التنبيه",
      render: (item: SiteAlertItem) => (
        <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm line-clamp-2 leading-relaxed max-w-xl">
          {item.content}
        </p>
      ),
    },
    {
      header: "الحالة",
      align: "center",
      render: (item: SiteAlertItem) => {
        const isToggling = togglingId === item.id;
        return (
          <div className="flex items-center justify-center gap-2 whitespace-nowrap">
            <button
              type="button"
              onClick={() => handleToggleStatus(item)}
              disabled={isToggling}
              title={item.isActive ? "اضغط للتعطيل" : "اضغط للتفعيل"}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                item.isActive
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800"
                  : "bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700"
              }`}
            >
              {isToggling ? (
                <div className="h-2.5 w-2.5 animate-spin rounded-full border border-current border-t-transparent" />
              ) : (
                <span
                  className={`h-2 w-2 rounded-full ${
                    item.isActive
                      ? "bg-emerald-500 animate-pulse"
                      : "bg-gray-400"
                  }`}
                />
              )}
              <span>{item.isActive ? "نشط معروض" : "معطل"}</span>
            </button>
          </div>
        );
      },
    },
    {
      header: "تاريخ الإنشاء",
      align: "center",
      render: (item: SiteAlertItem) => (
        <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
          <CalenderIcon className="w-3.5 h-3.5" />
          <span>{formatDate(item.createdAt)}</span>
        </div>
      ),
    },
    {
      header: "الإجراءات",
      align: "center",
      render: (item: SiteAlertItem) => (
        <div className="flex items-center justify-center gap-1.5 whitespace-nowrap">
          {/* Edit */}
          <button
            type="button"
            onClick={() => {
              setAlertToEdit(item);
              setIsModalOpen(true);
            }}
            title="تعديل التنبيه"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-900/30 dark:hover:text-brand-400 transition-colors cursor-pointer"
          >
            <PencilIcon className="w-4 h-4" />
          </button>

          {/* Delete */}
          <button
            type="button"
            onClick={() => setAlertToDelete(item)}
            title="حذف التنبيه"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400 transition-colors cursor-pointer"
          >
            <TrashBinIcon className="w-4 h-4 fill-current" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Toast / Alert Feedback */}
      {feedback && (
        <div
          className={`flex items-center justify-between gap-3 p-4 rounded-xl border text-sm animate-in fade-in slide-in-from-top-2 duration-200 ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
              : "bg-red-50 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === "success" ? (
              <CheckCircleIcon className="w-5 h-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <AlertIcon className="w-5 h-5 shrink-0 text-red-600 dark:text-red-400 fill-current" />
            )}
            <span className="font-medium">{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors cursor-pointer"
          >
            <CloseIcon className="w-4 h-4 fill-current" />
          </button>
        </div>
      )}

      {/* Filter Component */}
      <DataTableFilter
        title="تصفية التنبيهات"
        fields={filterFields}
        values={filterValues}
        totalCount={filteredAlerts.length}
        itemUnitName="تنبيه"
        onChange={handleFilterChange}
        onReset={handleFilterReset}
      />

      {/* Alerts DataTable */}
      <DataTable
        title="قائمة تنبيهات وإعلانات الموقع"
        totalCount={filteredAlerts.length}
        createButton={{
          label: "إضافة تنبيه جديد",
          onClick: () => {
            setAlertToEdit(null);
            setIsModalOpen(true);
          },
          icon: <PlusIcon className="w-4 h-4 stroke-current" />,
        }}
        columns={columns}
        data={filteredAlerts}
        emptyMessage="لا توجد تنبيهات مطابقة لخيارات البحث الحالية"
      />

      {/* Create / Edit Modal */}
      <SiteAlertModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setAlertToEdit(null);
        }}
        alertToEdit={alertToEdit}
        onSuccess={handleModalSuccess}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(alertToDelete)}
        title="حذف تنبيه الموقع"
        subtitle="سيتم إزالة هذا التنبيه نهائياً من الموقع"
        itemName={alertToDelete?.title}
        itemId={alertToDelete?.id}
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setAlertToDelete(null)}
      />
    </div>
  );
}
