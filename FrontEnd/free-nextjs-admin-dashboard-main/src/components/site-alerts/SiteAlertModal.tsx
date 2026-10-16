"use client";

import React, { useState, useEffect, useTransition } from "react";
import { Modal } from "@/components/ui/modal";
import { SiteAlertItem } from "@/types/site-alert";
import {
  createSiteAlertAction,
  updateSiteAlertAction,
} from "@/actions/admin/site-alerts";
import { BellIcon, AlertIcon, CheckCircleIcon } from "@/icons";

interface SiteAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  alertToEdit?: SiteAlertItem | null;
  onSuccess: (savedAlert: SiteAlertItem, isNew: boolean) => void;
}

export default function SiteAlertModal({
  isOpen,
  onClose,
  alertToEdit,
  onSuccess,
}: SiteAlertModalProps) {
  const isEdit = Boolean(alertToEdit);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Populate form when modal opens or alertToEdit changes
  useEffect(() => {
    if (isOpen) {
      if (alertToEdit) {
        setTitle(alertToEdit.title || "");
        setContent(alertToEdit.content || "");
        setIsActive(alertToEdit.isActive);
      } else {
        setTitle("");
        setContent("");
        setIsActive(true);
      }
      setErrors({});
      setServerError(null);
    }
  }, [isOpen, alertToEdit]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!title.trim()) {
      errs.title = "يرجى كتابة عنوان للتنبيه";
    } else if (title.trim().length > 500) {
      errs.title = "عنوان التنبيه يجب ألا يتجاوز 500 حرف";
    }

    if (!content.trim()) {
      errs.content = "يرجى إدخال نص ومحتوى التنبيه";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) return;

    startTransition(async () => {
      try {
        if (isEdit && alertToEdit) {
          const res = await updateSiteAlertAction(alertToEdit.id, {
            title: title.trim(),
            content: content.trim(),
            isActive,
          });

          if (res.success) {
            onSuccess(
              res.data || {
                ...alertToEdit,
                title: title.trim(),
                content: content.trim(),
                isActive,
              },
              false
            );
            onClose();
          } else {
            setServerError(res.message || "فشل تعديل التنبيه");
          }
        } else {
          const res = await createSiteAlertAction({
            title: title.trim(),
            content: content.trim(),
            isActive,
          });

          if (res.success) {
            onSuccess(
              res.data || {
                id: Date.now(),
                title: title.trim(),
                content: content.trim(),
                isActive,
                createdAt: new Date().toISOString(),
              },
              true
            );
            onClose();
          } else {
            setServerError(res.message || "فشل إضافة التنبيه");
          }
        }
      } catch (err: any) {
        console.error("Site Alert submit error:", err);
        setServerError("حدث خطأ غير متوقع أثناء الحفظ.");
      }
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-xl w-full p-6 sm:p-8"
      showCloseButton={true}
    >
      <div className="space-y-6 text-start" dir="rtl">
        {/* Header */}
        <div className="flex items-center gap-3.5 pb-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
            <BellIcon className="h-6 w-6 fill-current" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {isEdit ? "تعديل تنبيه الموقع" : "إضافة تنبيه جديد للموقع"}
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {isEdit
                ? "تعديل تفاصيل التنبيه وشريط الإعلانات المعروض في واجهة الموقع"
                : "إنشاء إشعار أو تنبيه عام يظهر للزوار في واجهة الموقع"}
            </p>
          </div>
        </div>

        {/* Server Error Alert */}
        {serverError && (
          <div className="flex items-start gap-3 rounded-xl bg-red-50 p-4 text-red-700 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800/30">
            <AlertIcon className="h-5 w-5 shrink-0 mt-0.5 fill-current" />
            <div className="text-sm font-medium">{serverError}</div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              عنوان التنبيه <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors((prev) => ({ ...prev, title: "" }));
              }}
              placeholder="مثال: بث مباشر لدرس فضيلة الشيخ الأسبوعي..."
              maxLength={500}
              className={`w-full rounded-xl border px-4 py-2.5 text-sm transition-all focus:outline-none dark:bg-gray-800 dark:text-white ${
                errors.title
                  ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900/30"
                  : "border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700"
              }`}
            />
            {errors.title ? (
              <p className="text-xs text-red-500 mt-1">{errors.title}</p>
            ) : (
              <p className="text-xs text-gray-400 mt-1">
                {title.length}/500 حرف
              </p>
            )}
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              نص ومحتوى التنبيه <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                if (errors.content)
                  setErrors((prev) => ({ ...prev, content: "" }));
              }}
              placeholder="اكتب تفاصيل التنبيه أو الإعلان الذي سيظهر للجمهور..."
              className={`w-full rounded-xl border px-4 py-3 text-sm transition-all focus:outline-none dark:bg-gray-800 dark:text-white resize-none ${
                errors.content
                  ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900/30"
                  : "border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700"
              }`}
            />
            {errors.content && (
              <p className="text-xs text-red-500 mt-1">{errors.content}</p>
            )}
          </div>

          {/* IsActive Toggle Card */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/40">
            <div>
              <span className="block text-sm font-semibold text-gray-900 dark:text-white">
                حالة ظهور التنبيه في الموقع
              </span>
              <span className="block text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {isActive
                  ? "التنبيه نشط الآن وسيظهر فوراً في الواجهة العامة للموقع"
                  : "التنبيه معطل ولن يظهر للزوار حتى تقوم بتفعيله"}
              </span>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={isActive}
              onClick={() => setIsActive(!isActive)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isActive ? "bg-brand-500" : "bg-gray-300 dark:bg-gray-700"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  isActive ? "translate-x-0" : "-translate-x-5"
                }`}
              />
            </button>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 active:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-500 text-sm font-semibold text-white shadow-theme-xs hover:bg-brand-600 active:bg-brand-700 disabled:opacity-50 transition-all cursor-pointer"
            >
              {isPending && (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              )}
              <span>
                {isPending
                  ? "جاري الحفظ..."
                  : isEdit
                  ? "حفظ التعديلات"
                  : "إضافة التنبيه"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
