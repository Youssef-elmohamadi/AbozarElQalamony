"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { UserProfile } from "@/types/user";
import { useUser } from "@/context/UserContext";
import UserMetaCard from "./UserMetaCard";
import UserInfoCard from "./UserInfoCard";
import UserSecurityCard from "./UserSecurityCard";
import EditProfileModal from "./EditProfileModal";
import { AlertIcon } from "@/icons";

interface UserProfileViewProps {
  initialUser?: UserProfile | null;
}

export default function UserProfileView({ initialUser }: UserProfileViewProps) {
  const { user: contextUser, loading, error, refreshUser, setUser } = useUser();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<"info" | "password">("info");

  // Sync initial user with context if provided
  useEffect(() => {
    if (initialUser && !contextUser) {
      setUser(initialUser);
    }
  }, [initialUser, contextUser, setUser]);

  const activeUser = contextUser || initialUser || null;

  const handleOpenEdit = (tab: "info" | "password" = "info") => {
    setModalTab(tab);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header and Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            الملف الشخصي
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            إدارة بيانات حسابك الشخصي والصورة وكلمة المرور
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
            <li className="font-medium text-brand-600 dark:text-brand-400">
              الملف الشخصي
            </li>
          </ol>
        </nav>
      </div>

      {/* Error state */}
      {error && !activeUser && (
        <div className="flex items-center justify-between p-4 rounded-2xl border bg-red-50 border-red-200 text-red-800 dark:bg-red-950/30 dark:border-red-800 dark:text-red-300">
          <div className="flex items-center gap-2 text-sm font-medium">
            <AlertIcon className="w-5 h-5 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => refreshUser()}
            className="px-3.5 py-1.5 rounded-xl bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-colors cursor-pointer"
          >
            إعادة المحاولة
          </button>
        </div>
      )}

      {/* Hero Meta Card */}
      <UserMetaCard
        user={activeUser}
        loading={loading && !activeUser}
        onEditClick={() => handleOpenEdit("info")}
      />

      {/* Personal Info Card */}
      <UserInfoCard
        user={activeUser}
        loading={loading && !activeUser}
        onEditClick={() => handleOpenEdit("info")}
      />

      {/* Security & Credentials Card */}
      <UserSecurityCard onEditPasswordClick={() => handleOpenEdit("password")} />

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        initialTab={modalTab}
      />
    </div>
  );
}
