"use client";

import React, { useState, useTransition, useMemo, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { deleteUserAction, getUsersAction } from "@/actions/admin/users";
import { PencilIcon, TrashBinIcon, CloseIcon } from "@/icons";
import {
  DataTable,
  DataTableFilter,
  DataTablePagination,
  DeleteConfirmModal,
  ColumnDef,
  FilterField,
} from "@/components/common/data-table";

export interface UserItem {
  id: number;
  name: string;
  email: string;
  profileImagePath: string | null;
  roleId: number;
  roleName: string;
}

interface UsersTableProps {
  initialUsers: UserItem[];
  initialTotalCount?: number;
  initialPage?: number;
  initialPageSize?: number;
  initialRoleId?: string;
  initialSearch?: string;
}

export default function UsersTable({
  initialUsers,
  initialTotalCount,
  initialPage = 1,
  initialPageSize = 10,
  initialRoleId = "all",
  initialSearch = "",
}: UsersTableProps) {
  const [users, setUsers] = useState<UserItem[]>(initialUsers);
  const [totalCount, setTotalCount] = useState<number>(
    initialTotalCount ?? initialUsers.length
  );
  const [searchName, setSearchName] = useState(initialSearch);
  const [selectedRoleId, setSelectedRoleId] = useState<string>(initialRoleId);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [itemsPerPage, setItemsPerPage] = useState(initialPageSize);
  const [isFetching, setIsFetching] = useState(false);
  const isInitialMount = useRef(true);

  // Delete modal state
  const [userToDelete, setUserToDelete] = useState<UserItem | null>(null);
  const [isDeleting, startDeleteTransition] = useTransition();
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Dynamic role options
  const roleOptions = useMemo(() => {
    const map = new Map<number, string>();
    map.set(1, "مدير عام");
    map.set(2, "مسؤول");

    users.forEach((u) => {
      if (u.roleId && !map.has(u.roleId)) {
        map.set(u.roleId, u.roleName || `الدور ${u.roleId}`);
      }
    });

    return [
      { label: "جميع الصلاحيات", value: "all" },
      ...Array.from(map.entries()).map(([id, label]) => ({
        label: `${label}`,
        value: String(id),
      })),
    ];
  }, [users]);

  // Fetch users directly from the API endpoint
  const fetchUsers = async (
    page: number,
    pageSize: number,
    roleIdVal: string,
    nameVal: string
  ) => {
    setIsFetching(true);
    try {
      const roleIdNum =
        roleIdVal !== "all" && Number(roleIdVal) > 0
          ? Number(roleIdVal)
          : null;
      const nameParam = nameVal.trim() ? nameVal.trim() : null;

      const res = await getUsersAction(page, pageSize, roleIdNum, nameParam);
      if (res?.data?.items && Array.isArray(res.data.items)) {
        setUsers(res.data.items);
        setTotalCount(res.data.totalCount ?? res.data.items.length);
      } else if (res?.data && Array.isArray(res.data)) {
        setUsers(res.data);
        setTotalCount(res.data.length);
      } else {
        setUsers([]);
        setTotalCount(0);
      }
      setCurrentPage(page);

      // Sync URL query params without full page reload
      if (typeof window !== "undefined") {
        const params = new URLSearchParams();
        if (page > 1) params.set("page", String(page));
        if (pageSize !== 10) params.set("pageSize", String(pageSize));
        if (roleIdVal !== "all") params.set("roleId", roleIdVal);
        if (nameVal.trim()) params.set("name", nameVal.trim());
        const qs = params.toString();
        window.history.replaceState(
          null,
          "",
          qs ? `?${qs}` : window.location.pathname
        );
      }
    } catch (err) {
      console.error("Error fetching users from endpoint:", err);
    } finally {
      setIsFetching(false);
    }
  };

  // Debounced search on name typing
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const timer = setTimeout(() => {
      fetchUsers(1, itemsPerPage, selectedRoleId, searchName);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchName]);

  // Handlers for filter changes
  const handleFilterChange = (key: string, value: string) => {
    if (key === "name") {
      setSearchName(value);
    } else if (key === "roleId") {
      setSelectedRoleId(value);
      fetchUsers(1, itemsPerPage, value, searchName);
    }
  };

  const handleResetFilters = () => {
    setSearchName("");
    setSelectedRoleId("all");
    fetchUsers(1, itemsPerPage, "all", "");
  };

  const handlePageChange = (newPage: number) => {
    fetchUsers(newPage, itemsPerPage, selectedRoleId, searchName);
  };

  const handlePageSizeChange = (newSize: number) => {
    setItemsPerPage(newSize);
    fetchUsers(1, newSize, selectedRoleId, searchName);
  };

  // Handle Delete Confirmation
  const confirmDelete = () => {
    if (!userToDelete) return;

    startDeleteTransition(async () => {
      try {
        const res = await deleteUserAction(userToDelete.id);
        if (res.success) {
          setFeedback({ type: "success", message: res.message });
          setUserToDelete(null);
          const targetPage =
            users.length === 1 && currentPage > 1
              ? currentPage - 1
              : currentPage;
          fetchUsers(targetPage, itemsPerPage, selectedRoleId, searchName);
        } else {
          setFeedback({ type: "error", message: res.message });
        }
      } catch (err: any) {
        setFeedback({
          type: "error",
          message: err?.message || "حدث خطأ أثناء محاولة الحذف",
        });
      }
    });
  };

  // Role badge helper
  const getRoleBadge = (roleName: string) => {
    switch (roleName) {
      case "Super Admin":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#C0673F]/15 text-[#C0673F] border border-[#C0673F]/30 dark:bg-[#C0673F]/25 dark:text-[#EBC7B3]">
            مدير عام
          </span>
        );
      case "Admin":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#3F4A2B]/15 text-[#3F4A2B] border border-[#3F4A2B]/30 dark:bg-[#3F4A2B]/30 dark:text-[#DFE5D7]">
            مسؤول
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200 dark:bg-white/10 dark:text-gray-300 dark:border-gray-700">
            {roleName || "مستخدم"}
          </span>
        );
    }
  };

  const filterFields: FilterField[] = [
    {
      key: "name",
      label: "البحث بالاسم",
      type: "search",
      placeholder: "ابحث باسم المستخدم...",
    },
    {
      key: "roleId",
      label: "الفلترة برقم الصلاحية",
      type: "select",
      options: roleOptions,
    },
  ];

  // Reusable Columns definition
  const columns: ColumnDef<UserItem>[] = [
    {
      header: "المعرف",
      accessor: (user) => (
        <span className="font-mono text-xs font-semibold text-gray-500 dark:text-gray-400">
          #{user.id}
        </span>
      ),
    },
    {
      header: "المستخدم",
      render: (user) => (
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-full overflow-hidden bg-brand-100 dark:bg-brand-900/40 shrink-0 border border-brand-200 dark:border-brand-800 flex items-center justify-center font-bold text-brand-700 dark:text-brand-300 text-sm">
            {user.profileImagePath ? (
              <Image
                src={
                  user.profileImagePath.startsWith("http")
                    ? user.profileImagePath
                    : `${
                        process.env.NEXT_PUBLIC_API_URL || "https://localhost:7281"
                      }${user.profileImagePath}`
                }
                alt={user.name}
                width={40}
                height={40}
                unoptimized
                className="w-full h-full object-cover"
                onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                  (e.currentTarget as HTMLElement).style.display = "none";
                }}
              />
            ) : (
              user.name.slice(0, 2).toUpperCase()
            )}
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">
              {user.name}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: "البريد الإلكتروني",
      accessor: (user) => (
        <span className="font-mono text-xs text-gray-600 dark:text-gray-400">
          {user.email}
        </span>
      ),
    },
    {
      header: "الصلاحية",
      render: (user) => getRoleBadge(user.roleName),
    },
    {
      header: "الإجراءات",
      align: "center",
      render: (user) => (
        <div className="inline-flex items-center gap-2">
          <Link
            href={`/admin/users/${user.id}/edit`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400 text-xs font-semibold transition-colors cursor-pointer"
          >
            <PencilIcon className="w-3.5 h-3.5 fill-current" />
            <span>تعديل</span>
          </Link>

          <button
            type="button"
            onClick={() => setUserToDelete(user)}
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            إدارة المسؤولين
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            عرض وتعديل والتحكم في صلاحيات المستخدمين والمسؤولين
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
              المسؤولين
            </li>
          </ol>
        </nav>
      </div>

      {feedback && (
        <div
          className={`flex items-center justify-between p-4 rounded-xl border ${
            feedback.type === "success"
              ? "bg-green-50 border-green-200 text-green-800 dark:bg-green-950/30 dark:border-green-800 dark:text-green-300"
              : "bg-red-50 border-red-200 text-red-800 dark:bg-red-950/30 dark:border-red-800 dark:text-red-300"
          }`}
        >
          <div className="flex items-center gap-2 text-sm font-medium">
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="p-1 hover:opacity-75 transition-opacity cursor-pointer"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>
      )}

      <DataTableFilter
        fields={filterFields}
        values={{ name: searchName, roleId: selectedRoleId }}
        totalCount={totalCount}
        itemUnitName="مستخدم"
        isFetching={isFetching}
        onChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      <DataTable
        title="كل المستخدمين"
        totalCount={totalCount}
        createButton={{
          label: "إضافة مستخدم جديد",
          href: "/admin/users/create",
        }}
        columns={columns}
        data={users}
        isFetching={isFetching}
        getRowKey={(user) => user.id}
        pagination={
          <DataTablePagination
            currentPage={currentPage}
            pageSize={itemsPerPage}
            totalCount={totalCount}
            isFetching={isFetching}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        }
      />

      <DeleteConfirmModal
        isOpen={!!userToDelete}
        itemName={userToDelete?.name}
        itemId={userToDelete?.id}
        isDeleting={isDeleting}
        onConfirm={confirmDelete}
        onClose={() => setUserToDelete(null)}
      />
    </div>
  );
}
