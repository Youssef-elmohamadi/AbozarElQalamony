"use client";

import React, { useState, useTransition, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createUserAction } from "@/actions/admin/users";
import {
  UserIcon,
  EnvelopeIcon,
  LockIcon,
  EyeIcon,
  EyeCloseIcon,
  CloseIcon,
  CheckCircleIcon,
  AlertIcon,
  TrashBinIcon,
} from "@/icons";

export default function CreateUserForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Form fields state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState<string>("2"); // default to مسؤول (Admin)
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Validation errors state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [serverSuccess, setServerSuccess] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Handle Image Selection with Validation
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate image format
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg", "image/gif"];
    if (!validTypes.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        profileImage: "يجب اختيار ملف صورة صالح (JPG, PNG, WEBP)",
      }));
      return;
    }

    // Validate size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setErrors((prev) => ({
        ...prev,
        profileImage: "حجم الصورة كبير جداً، الحد الأقصى هو 5 ميجابايت",
      }));
      return;
    }

    // Clear any previous image errors
    setErrors((prev) => {
      const updated = { ...prev };
      delete updated.profileImage;
      return updated;
    });

    setSelectedFile(file);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setErrors((prev) => {
      const updated = { ...prev };
      delete updated.profileImage;
      return updated;
    });
  };

  // Comprehensive Front-end Validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // 1. Name validation
    if (!name.trim()) {
      newErrors.name = "اسم المستخدم مطلوب";
    } else if (name.trim().length < 3) {
      newErrors.name = "اسم المستخدم يجب ألا يقل عن 3 أحرف";
    }

    // 2. Email validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email.trim()) {
      newErrors.email = "البريد الإلكتروني مطلوب";
    } else if (!emailRegex.test(email.trim())) {
      newErrors.email = "صيغة البريد الإلكتروني غير صحيحة (مثال: user@example.com)";
    }

    // 3. Password validation
    if (!password) {
      newErrors.password = "كلمة المرور مطلوبة";
    } else if (password.length < 6) {
      newErrors.password = "كلمة المرور يجب ألا تقل عن 6 أحرف";
    }

    // 4. Role validation
    if (!roleId || Number(roleId) <= 0) {
      newErrors.roleId = "يرجى اختيار صلاحية / دور المستخدم";
    }

    // 5. Image validation if selected
    if (selectedFile) {
      const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg", "image/gif"];
      if (!validTypes.includes(selectedFile.type)) {
        newErrors.profileImage = "يجب اختيار ملف صورة صالح (JPG, PNG, WEBP)";
      } else if (selectedFile.size > 5 * 1024 * 1024) {
        newErrors.profileImage = "حجم الصورة يجب ألا يتجاوز 5 ميجابايت";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle Form Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setServerSuccess(null);

    // Run client-side validation first
    const isValid = validateForm();
    if (!isValid) {
      return;
    }

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("Name", name.trim());
        formData.append("Email", email.trim());
        formData.append("Password", password);
        formData.append("RoleId", roleId);
        if (selectedFile) {
          formData.append("ProfileImage", selectedFile);
        }

        const res = await createUserAction(formData);

        if (res.success) {
          setServerSuccess(res.message || "تم إنشاء الحساب بنجاح!");
          setTimeout(() => {
            router.push("/admin/users");
            router.refresh();
          }, 1000);
        } else {
          setServerError(res.message || "حدث خطأ أثناء إنشاء المستخدم");
          if (res.errors) {
            // Map server validation errors to fields
            const serverFieldErrors: Record<string, string> = {};
            for (const [key, msgs] of Object.entries(res.errors)) {
              const lowerKey = key.toLowerCase();
              if (lowerKey.includes("name")) serverFieldErrors.name = Array.isArray(msgs) ? msgs[0] : msgs;
              if (lowerKey.includes("email")) serverFieldErrors.email = Array.isArray(msgs) ? msgs[0] : msgs;
              if (lowerKey.includes("password")) serverFieldErrors.password = Array.isArray(msgs) ? msgs[0] : msgs;
              if (lowerKey.includes("role")) serverFieldErrors.roleId = Array.isArray(msgs) ? msgs[0] : msgs;
              if (lowerKey.includes("image")) serverFieldErrors.profileImage = Array.isArray(msgs) ? msgs[0] : msgs;
            }
            if (Object.keys(serverFieldErrors).length > 0) {
              setErrors(serverFieldErrors);
            }
          }
        }
      } catch (err: any) {
        setServerError(err?.message || "تعذر الاتصال بالخادم، يرجى المحاولة لاحقاً");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. المسار والعنوان (Breadcrumb) */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            إنشاء مستخدم / مسؤول جديد
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            أدخل بيانات الحساب الجديد والصلاحية وصورة الملف الشخصي
          </p>
        </div>
        <nav aria-label="breadcrumb">
          <ol className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <li>
              <Link
                href="/admin"
                className="hover:text-brand-500 dark:hover:text-brand-400 transition-colors"
              >
                الرئيسية
              </Link>
            </li>
            <li>
              <span className="text-gray-400">/</span>
            </li>
            <li>
              <Link
                href="/admin/users"
                className="hover:text-brand-500 dark:hover:text-brand-400 transition-colors"
              >
                المسؤولين
              </Link>
            </li>
            <li>
              <span className="text-gray-400">/</span>
            </li>
            <li className="font-medium text-brand-600 dark:text-brand-400">
              إنشاء حساب جديد
            </li>
          </ol>
        </nav>
      </div>

      {/* تنبيه الخطأ العام */}
      {serverError && (
        <div className="flex items-center justify-between p-4 rounded-xl border bg-red-50 border-red-200 text-red-800 dark:bg-red-950/30 dark:border-red-800 dark:text-red-300 animate-in fade-in duration-200">
          <div className="flex items-center gap-2 text-sm font-medium">
            <AlertIcon className="w-5 h-5 shrink-0 text-red-600" />
            <span>{serverError}</span>
          </div>
          <button
            type="button"
            onClick={() => setServerError(null)}
            className="p-1 hover:opacity-75 transition-opacity cursor-pointer"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* تنبيه النجاح العام */}
      {serverSuccess && (
        <div className="flex items-center justify-between p-4 rounded-xl border bg-green-50 border-green-200 text-green-800 dark:bg-green-950/30 dark:border-green-800 dark:text-green-300 animate-in fade-in duration-200">
          <div className="flex items-center gap-2 text-sm font-medium">
            <CheckCircleIcon className="w-5 h-5 shrink-0 text-green-600" />
            <span>{serverSuccess} (جاري التحويل لصفحة المستخدمين...)</span>
          </div>
        </div>
      )}

      {/* 2. كارت النموذج الرئيسي */}
      <form
        onSubmit={handleSubmit}
        noValidate
        className="rounded-2xl border border-gray-200/90 bg-white p-6 md:p-8 shadow-xs dark:border-gray-800 dark:bg-gray-900"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* حقل اسم المستخدم */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
              اسم المستخدم <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-4 text-gray-400">
                <UserIcon className="w-5 h-5" />
              </div>
              <input
                type="text"
                placeholder="أدخل اسم المستخدم الكامل"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) {
                    setErrors((prev) => ({ ...prev, name: "" }));
                  }
                }}
                className={`w-full h-12 ps-12 pe-4 rounded-xl border text-sm text-gray-800 placeholder:text-gray-400 transition-colors focus:outline-hidden dark:bg-gray-800/60 dark:text-white ${
                  errors.name
                    ? "border-red-400 bg-red-50/20 focus:border-red-500 focus:ring-2 focus:ring-red-400/20"
                    : "border-gray-200 bg-[#FAFAF5] focus:border-[#3F4A2B] focus:ring-2 focus:ring-[#3F4A2B]/15 dark:border-gray-800"
                }`}
              />
            </div>
            {errors.name && (
              <p className="text-xs text-red-500 mt-1.5 font-medium flex items-center gap-1">
                <span>{errors.name}</span>
              </p>
            )}
          </div>

          {/* حقل البريد الإلكتروني */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
              البريد الإلكتروني <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-4 text-gray-400">
                <EnvelopeIcon className="w-5 h-5" />
              </div>
              <input
                type="email"
                placeholder="example@domain.com"
                value={email}
                dir="ltr"
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) {
                    setErrors((prev) => ({ ...prev, email: "" }));
                  }
                }}
                className={`w-full h-12 ps-12 pe-4 rounded-xl border text-sm text-gray-800 placeholder:text-gray-400 transition-colors focus:outline-hidden text-start dark:bg-gray-800/60 dark:text-white ${
                  errors.email
                    ? "border-red-400 bg-red-50/20 focus:border-red-500 focus:ring-2 focus:ring-red-400/20"
                    : "border-gray-200 bg-[#FAFAF5] focus:border-[#3F4A2B] focus:ring-2 focus:ring-[#3F4A2B]/15 dark:border-gray-800"
                }`}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-red-500 mt-1.5 font-medium flex items-center gap-1">
                <span>{errors.email}</span>
              </p>
            )}
          </div>

          {/* حقل كلمة المرور */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
              كلمة المرور <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-4 text-gray-400">
                <LockIcon className="w-5 h-5" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="أدخل كلمة المرور (6 أحرف على الأقل)"
                value={password}
                dir="ltr"
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) {
                    setErrors((prev) => ({ ...prev, password: "" }));
                  }
                }}
                className={`w-full h-12 ps-12 pe-12 rounded-xl border text-sm text-gray-800 placeholder:text-gray-400 transition-colors focus:outline-hidden text-start dark:bg-gray-800/60 dark:text-white ${
                  errors.password
                    ? "border-red-400 bg-red-50/20 focus:border-red-500 focus:ring-2 focus:ring-red-400/20"
                    : "border-gray-200 bg-[#FAFAF5] focus:border-[#3F4A2B] focus:ring-2 focus:ring-[#3F4A2B]/15 dark:border-gray-800"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 end-0 flex items-center pe-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors cursor-pointer"
                title={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
              >
                {showPassword ? (
                  <EyeCloseIcon className="w-5 h-5" />
                ) : (
                  <EyeIcon className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-500 mt-1.5 font-medium flex items-center gap-1">
                <span>{errors.password}</span>
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
              الصلاحية / الدور <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={roleId}
                onChange={(e) => {
                  setRoleId(e.target.value);
                  if (errors.roleId) {
                    setErrors((prev) => ({ ...prev, roleId: "" }));
                  }
                }}
                className={`w-full h-12 appearance-none px-4 pe-10 rounded-xl border text-sm text-gray-800 focus:outline-hidden transition-colors dark:bg-gray-800/60 dark:text-white cursor-pointer ${
                  errors.roleId
                    ? "border-red-400 bg-red-50/20 focus:border-red-500 focus:ring-2 focus:ring-red-400/20"
                    : "border-gray-200 bg-[#FAFAF5] focus:border-[#3F4A2B] focus:ring-2 focus:ring-[#3F4A2B]/15 dark:border-gray-800"
                }`}
              >
                <option value="1">مدير عام (Super Admin) - Role ID: 1</option>
                <option value="2">مسؤول (Admin) - Role ID: 2</option>
                <option value="3">مستخدم (User) - Role ID: 3</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 end-3 flex items-center text-gray-400">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>
            {errors.roleId && (
              <p className="text-xs text-red-500 mt-1.5 font-medium flex items-center gap-1">
                <span>{errors.roleId}</span>
              </p>
            )}
          </div>

          {/* حقل رفع الصورة الشخصية (ProfileImage) - عرض كامل */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
              صورة الملف الشخصي (Profile Image)
            </label>

            <div
              className={`rounded-2xl border-2 border-dashed p-5 transition-colors ${
                errors.profileImage
                  ? "border-red-400 bg-red-50/20"
                  : "border-gray-200 bg-[#FAFAF5] hover:border-[#3F4A2B]/50 dark:border-gray-800 dark:bg-gray-800/40"
              }`}
            >
              {previewUrl ? (
                /* عرض المعاينة للصورة المختارة */
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-[#3F4A2B]/30 shadow-xs shrink-0 bg-gray-100">
                    <img
                      src={previewUrl}
                      alt="معاينة الصورة"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 text-center sm:text-start">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white break-all">
                      {selectedFile?.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      الحجم: {((selectedFile?.size || 0) / 1024).toFixed(1)} كيلوبايت
                    </p>
                    <div className="flex items-center justify-center sm:justify-start gap-2 mt-3">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                      >
                        تغيير الصورة
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-red-200 text-xs font-semibold text-red-600 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                      >
                        <TrashBinIcon className="w-3.5 h-3.5 fill-current" />
                        <span>حذف الصورة</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* منطقة رفع الصورة عند عدم الاختيار */
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center py-6 cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-full bg-[#3F4A2B]/10 text-[#3F4A2B] dark:bg-[#3F4A2B]/25 dark:text-[#DFE5D7] flex items-center justify-center mb-3">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                    اضغط هنا لاختيار صورة الملف الشخصي
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    يدعم صيغ JPG, PNG, WEBP حتى حد أقصى 5 ميجابايت
                  </p>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/jpg"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>

            {errors.profileImage && (
              <p className="text-xs text-red-500 mt-1.5 font-medium flex items-center gap-1">
                <span>{errors.profileImage}</span>
              </p>
            )}
          </div>
        </div>

        {/* 3. شريط أزرار الإجراءات في الأسفل */}
        <div className="flex flex-wrap items-center justify-end gap-3 mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
          <Link
            href="/admin/users"
            className="px-5 py-2.5 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
          >
            إلغاء
          </Link>

          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#3F4A2B] text-white text-sm font-semibold hover:bg-[#323b22] active:bg-[#272e1a] disabled:opacity-50 transition-colors shadow-theme-xs cursor-pointer"
          >
            {isPending && (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
            )}
            <span>{isPending ? "جاري الإنشاء..." : "إنشاء المستخدم"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
