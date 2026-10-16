"use client";

import React, { useState, useEffect, useRef, useTransition } from "react";
import Image from "next/image";
import { Modal } from "@/components/ui/modal";
import { useUser } from "@/context/UserContext";
import { updateProfileAction } from "@/actions/admin/users";
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

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "info" | "password";
}

export default function EditProfileModal({
  isOpen,
  onClose,
  initialTab = "info",
}: EditProfileModalProps) {
  const { user, setUser, refreshUser } = useUser();
  const [isPending, startTransition] = useTransition();

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  // Image states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Password visibility
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Feedback & validation
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [serverSuccess, setServerSuccess] = useState<string | null>(null);

  // Sync with current user whenever modal opens
  useEffect(() => {
    if (isOpen && user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setSelectedFile(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      setErrors({});
      setServerError(null);
      setServerSuccess(null);
    }
  }, [isOpen, user]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        profileImage: "يجب اختيار ملف صورة بصيغة صالحة (JPG, PNG, WEBP)",
      }));
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setErrors((prev) => ({
        ...prev,
        profileImage: "حجم الصورة كبير جداً، الحد الأقصى المسموح هو 5 ميجابايت",
      }));
      return;
    }

    setErrors((prev) => {
      const copy = { ...prev };
      delete copy.profileImage;
      return copy;
    });

    setSelectedFile(file);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleRemoveSelectedImage = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy.profileImage;
      return copy;
    });
  };

  const validateForm = () => {
    const errs: Record<string, string> = {};

    if (!name.trim()) {
      errs.name = "الاسم الكامل مطلوب";
    } else if (name.trim().length < 3) {
      errs.name = "يجب ألا يقل الاسم عن 3 أحرف";
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email.trim()) {
      errs.email = "البريد الإلكتروني مطلوب";
    } else if (!emailRegex.test(email.trim())) {
      errs.email = "صيغة البريد الإلكتروني غير صحيحة";
    }

    // Backend requires CurrentPassword to apply profile changes
    if (!currentPassword) {
      errs.currentPassword = "يرجى إدخال كلمة المرور الحالية لتأكيد التعديلات";
    }

    // If new password is provided
    if (newPassword) {
      if (newPassword.length < 6) {
        errs.newPassword = "كلمة المرور الجديدة يجب ألا تقل عن 6 أحرف";
      }
      if (newPassword !== confirmNewPassword) {
        errs.confirmNewPassword = "تأكيد كلمة المرور غير متطابق مع كلمة المرور الجديدة";
      }
    } else if (confirmNewPassword) {
      errs.newPassword = "يرجى إدخال كلمة المرور الجديدة";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setServerSuccess(null);

    if (!validateForm()) return;

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("Name", name.trim());
        formData.append("Email", email.trim());
        formData.append("CurrentPassword", currentPassword);

        if (newPassword) {
          formData.append("NewPassword", newPassword);
          formData.append("ConfirmNewPassword", confirmNewPassword);
        }

        if (selectedFile) {
          formData.append("ProfileImage", selectedFile);
        }

        const res = await updateProfileAction(formData);

        if (res.success) {
          setServerSuccess(res.message || "تم حفظ بيانات الملف الشخصي بنجاح!");
          if (res.data) {
            setUser(res.data);
          } else {
            await refreshUser();
          }

          setTimeout(() => {
            onClose();
          }, 1200);
        } else {
          setServerError(res.message || "حدث خطأ أثناء تعديل الملف الشخصي");
          if (res.errors) {
            const fieldErrors: Record<string, string> = {};
            for (const [key, msgs] of Object.entries(res.errors)) {
              const lowerKey = key.toLowerCase();
              const msg = Array.isArray(msgs) ? msgs[0] : msgs;
              if (lowerKey.includes("name")) fieldErrors.name = msg;
              if (lowerKey.includes("email")) fieldErrors.email = msg;
              if (lowerKey.includes("currentpassword")) fieldErrors.currentPassword = msg;
              if (lowerKey.includes("newpassword") && !lowerKey.includes("confirm")) fieldErrors.newPassword = msg;
              if (lowerKey.includes("confirm")) fieldErrors.confirmNewPassword = msg;
              if (lowerKey.includes("image")) fieldErrors.profileImage = msg;
            }
            if (Object.keys(fieldErrors).length > 0) {
              setErrors(fieldErrors);
            }
          }
        }
      } catch (err: any) {
        setServerError(err?.message || "تعذر الاتصال بالخادم، يرجى المحاولة لاحقاً");
      }
    });
  };

  const existingAvatarUrl = user?.profileImagePath
    ? user.profileImagePath.startsWith("http")
      ? user.profileImagePath
      : `${process.env.NEXT_PUBLIC_API_URL || "https://localhost:7281"}${
          user.profileImagePath.startsWith("/") ? "" : "/"
        }${user.profileImagePath}`
    : null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      showCloseButton={false}
      className="max-w-[720px] m-4"
    >
      <div
        dir="rtl"
        className="relative w-full overflow-hidden rounded-3xl bg-white p-6 dark:bg-gray-900 lg:p-8 text-right"
      >
        {/* Header with Title and Close Button */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              تعديل الملف الشخصي
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              تحديث بياناتك الشخصية والصورة وكلمة المرور في لوحة التحكم
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white transition-colors cursor-pointer shrink-0"
            title="إغلاق"
            aria-label="إغلاق"
          >
            <CloseIcon className="w-4 h-4 fill-current" />
          </button>
        </div>

        {serverError && (
          <div className="mt-4 flex items-center justify-between p-3.5 rounded-xl border bg-red-50 border-red-200 text-red-800 dark:bg-red-950/30 dark:border-red-800 dark:text-red-300 text-sm">
            <div className="flex items-center gap-2">
              <AlertIcon className="w-5 h-5 shrink-0 text-red-600" />
              <span>{serverError}</span>
            </div>
            <button
              type="button"
              onClick={() => setServerError(null)}
              className="p-1 hover:opacity-75 cursor-pointer"
            >
              <CloseIcon className="w-4 h-4" />
            </button>
          </div>
        )}

        {serverSuccess && (
          <div className="mt-4 flex items-center gap-2 p-3.5 rounded-xl border bg-green-50 border-green-200 text-green-800 dark:bg-green-950/30 dark:border-green-800 dark:text-green-300 text-sm font-medium">
            <CheckCircleIcon className="w-5 h-5 shrink-0 text-green-600" />
            <span>{serverSuccess}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="mt-5 space-y-5">
          {/* Avatar Upload Section */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
              الصورة الشخصية
            </label>
            <div className="flex items-center gap-4 p-4 rounded-2xl border border-gray-200 bg-[#FAFAF5] dark:border-gray-800 dark:bg-gray-800/40">
              <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-[#3F4A2B]/30 bg-gray-100 shrink-0 flex items-center justify-center font-bold text-lg text-[#3F4A2B] shadow-xs">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="معاينة"
                    className="w-full h-full object-cover"
                  />
                ) : existingAvatarUrl ? (
                  <Image
                    src={existingAvatarUrl}
                    alt={user?.name || "المستخدم"}
                    width={64}
                    height={64}
                    unoptimized
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{user?.name?.slice(0, 2) || "أد"}</span>
                )}
              </div>

              <div className="flex-1 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-1.5 rounded-lg border border-gray-300 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors shadow-xs cursor-pointer"
                  >
                    {previewUrl || existingAvatarUrl ? "تغيير الصورة" : "رفع صورة"}
                  </button>
                  {previewUrl && (
                    <button
                      type="button"
                      onClick={handleRemoveSelectedImage}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-red-200 text-xs font-semibold text-red-600 hover:bg-red-50 dark:border-red-900/60 dark:text-red-400 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                    >
                      <TrashBinIcon className="w-3.5 h-3.5 fill-current" />
                      إلغاء الصورة الجديدة
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-gray-400 dark:text-gray-500">
                  الصيغ المدعومة: JPG, PNG, WEBP (الحد الأقصى 5 ميجابايت)
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/jpg"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
            {errors.profileImage && (
              <p className="text-xs text-red-500 mt-1 font-medium">
                {errors.profileImage}
              </p>
            )}
          </div>

          {/* Name & Email Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                الاسم الكامل <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
                  }}
                  className={`w-full h-11 pr-10 pl-4 rounded-xl border text-sm text-gray-800 placeholder:text-gray-400 focus:outline-hidden text-right dark:bg-gray-800/60 dark:text-white transition-colors ${
                    errors.name
                      ? "border-red-400 bg-red-50/20 focus:border-red-500"
                      : "border-gray-200 bg-[#FAFAF5] focus:border-[#3F4A2B] dark:border-gray-700"
                  }`}
                  placeholder="أدخل اسمك الكامل"
                />
              </div>
              {errors.name && (
                <p className="text-xs text-red-500 mt-1 font-medium">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                البريد الإلكتروني <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400">
                  <EnvelopeIcon className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
                  }}
                  className={`w-full h-11 pr-10 pl-4 rounded-xl border text-sm text-gray-800 placeholder:text-gray-400 focus:outline-hidden text-right dark:bg-gray-800/60 dark:text-white transition-colors ${
                    errors.email
                      ? "border-red-400 bg-red-50/20 focus:border-red-500"
                      : "border-gray-200 bg-[#FAFAF5] focus:border-[#3F4A2B] dark:border-gray-700"
                  }`}
                  placeholder="example@domain.com"
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-500 mt-1 font-medium">{errors.email}</p>
              )}
            </div>
          </div>

          {/* Current Password (Required for saving profile) */}
          <div className="p-4 rounded-2xl border border-amber-200/80 bg-amber-50/40 dark:border-amber-900/40 dark:bg-amber-950/15">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                <LockIcon className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>كلمة المرور الحالية</span>
                <span className="text-red-500">*</span>
              </label>
              <span className="text-[11px] text-amber-700 dark:text-amber-400">
                (مطلوبة لتأكيد حفظ أي تغييرات)
              </span>
            </div>
            <div className="relative">
              <input
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                placeholder="أدخل كلمة المرور الحالية لتأكيد التعديلات"
                onChange={(e) => {
                  setCurrentPassword(e.target.value);
                  if (errors.currentPassword)
                    setErrors((prev) => ({ ...prev, currentPassword: "" }));
                }}
                className={`w-full h-11 pr-4 pl-11 rounded-xl border text-sm text-gray-800 placeholder:text-gray-400 focus:outline-hidden text-right dark:bg-gray-800/60 dark:text-white transition-colors ${
                  errors.currentPassword
                    ? "border-red-400 bg-red-50/20 focus:border-red-500"
                    : "border-gray-300 bg-white focus:border-[#3F4A2B] dark:border-gray-700"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors cursor-pointer"
                title={showCurrentPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
              >
                {showCurrentPassword ? (
                  <EyeCloseIcon className="w-5 h-5" />
                ) : (
                  <EyeIcon className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.currentPassword && (
              <p className="text-xs text-red-500 mt-1 font-medium">
                {errors.currentPassword}
              </p>
            )}
          </div>

          {/* New Password & Confirm Password (Optional) */}
          <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
            <div className="mb-3">
              <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300">
                تغيير كلمة المرور (اختياري)
              </h4>
              <p className="text-[11px] text-gray-400 mt-0.5">
                اترك هذه الحقول فارغة إذا كنت لا ترغب بتغيير كلمة المرور
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  كلمة المرور الجديدة
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    placeholder="6 أحرف على الأقل"
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      if (errors.newPassword)
                        setErrors((prev) => ({ ...prev, newPassword: "" }));
                    }}
                    className={`w-full h-11 pr-4 pl-11 rounded-xl border text-sm text-gray-800 placeholder:text-gray-400 focus:outline-hidden text-right dark:bg-gray-800/60 dark:text-white transition-colors ${
                      errors.newPassword
                        ? "border-red-400 bg-red-50/20 focus:border-red-500"
                        : "border-gray-200 bg-[#FAFAF5] focus:border-[#3F4A2B] dark:border-gray-700"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors cursor-pointer"
                    title={showNewPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                  >
                    {showNewPassword ? (
                      <EyeCloseIcon className="w-5 h-5" />
                    ) : (
                      <EyeIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="text-xs text-red-500 mt-1 font-medium">
                    {errors.newPassword}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  تأكيد كلمة المرور الجديدة
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmNewPassword}
                    placeholder="أعد إدخال كلمة المرور الجديدة"
                    onChange={(e) => {
                      setConfirmNewPassword(e.target.value);
                      if (errors.confirmNewPassword)
                        setErrors((prev) => ({ ...prev, confirmNewPassword: "" }));
                    }}
                    className={`w-full h-11 pr-4 pl-11 rounded-xl border text-sm text-gray-800 placeholder:text-gray-400 focus:outline-hidden text-right dark:bg-gray-800/60 dark:text-white transition-colors ${
                      errors.confirmNewPassword
                        ? "border-red-400 bg-red-50/20 focus:border-red-500"
                        : "border-gray-200 bg-[#FAFAF5] focus:border-[#3F4A2B] dark:border-gray-700"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors cursor-pointer"
                    title={showConfirmPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                  >
                    {showConfirmPassword ? (
                      <EyeCloseIcon className="w-5 h-5" />
                    ) : (
                      <EyeIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.confirmNewPassword && (
                  <p className="text-xs text-red-500 mt-1 font-medium">
                    {errors.confirmNewPassword}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-5 py-2.5 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#3F4A2B] text-white text-sm font-semibold hover:bg-[#323b22] active:bg-[#272e1a] disabled:opacity-50 transition-colors shadow-theme-xs cursor-pointer"
            >
              {isPending && (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
              )}
              <span>{isPending ? "جاري الحفظ..." : "حفظ التعديلات"}</span>
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
