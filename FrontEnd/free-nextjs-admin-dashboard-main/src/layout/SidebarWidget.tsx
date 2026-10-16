import React from "react";

export default function SidebarWidget() {
  return (
    <div
      className={`
        mx-auto mb-10 w-full max-w-60 rounded-2xl bg-white border border-gray-200/80 shadow-xs px-4 py-5 text-center dark:border-gray-800 dark:bg-white/[0.03]`}
    >
      <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
        لوحة تحكم عصرية
      </h3>
      <p className="mb-4 text-gray-500 text-theme-sm dark:text-gray-400">
        قالب إدارة متكامل وسريع يدعم اللغة العربية بشكل كامل.
      </p>
      <a
        href="#"
        className="flex items-center justify-center p-3 font-medium text-white rounded-lg bg-brand-500 text-theme-sm hover:bg-brand-600"
      >
        الترقية للحساب المميز
      </a>
    </div>
  );
}
