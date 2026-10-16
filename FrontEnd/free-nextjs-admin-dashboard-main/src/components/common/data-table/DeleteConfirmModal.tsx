"use client";

import React from "react";
import { TrashBinIcon } from "@/icons";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  title?: string;
  subtitle?: string;
  itemName?: string;
  itemId?: string | number;
  message?: string;
  isDeleting?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export default function DeleteConfirmModal({
  isOpen,
  title = "تأكيد الحذف",
  subtitle = "لا يمكن التراجع عن هذا الإجراء",
  itemName,
  itemId,
  message,
  isDeleting = false,
  onConfirm,
  onClose,
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-99999 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-xs">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900 border border-gray-100 dark:border-gray-800 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/50 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
            <TrashBinIcon className="w-6 h-6 fill-current" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              {title}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {subtitle}
            </p>
          </div>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
          {message ? (
            message
          ) : (
            <>
              هل أنت متأكد من رغبتك في حذف{" "}
              {itemName && (
                <span className="font-bold text-gray-900 dark:text-white">
                  "{itemName}"
                </span>
              )}
              {itemId !== undefined && (
                <span className="text-gray-500 dark:text-gray-400 font-mono text-xs">
                  {" "}
                  (المعرف: #{itemId})
                </span>
              )}
              ؟
            </>
          )}
        </p>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 rounded-xl border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors cursor-pointer"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-5 py-2 rounded-xl bg-red-600 text-sm font-medium text-white hover:bg-red-700 active:bg-red-800 disabled:opacity-50 transition-colors flex items-center gap-2 cursor-pointer"
          >
            {isDeleting ? "جاري الحذف..." : "نعم، تأكيد الحذف"}
          </button>
        </div>
      </div>
    </div>
  );
}
