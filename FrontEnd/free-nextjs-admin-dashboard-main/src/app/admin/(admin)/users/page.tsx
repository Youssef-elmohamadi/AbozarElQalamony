import React from "react";
import { Metadata } from "next";
import { getUsers } from "@/api/admin/users";
import UsersTable, { UserItem } from "@/components/users/UsersTable";

export const metadata: Metadata = {
  title: "المسؤولين والمستخدمين | لوحة التحكم",
  description: "إدارة وعرض قائمة المسؤولين والمستخدمين في النظام",
};


interface UsersPageProps {
  searchParams?: Promise<{
    page?: string;
    pageSize?: string;
    roleId?: string;
    name?: string;
  }>;
}

export default async function UsersPage({ searchParams }: UsersPageProps) {
  const params = (await searchParams) || {};
  const page = params.page ? parseInt(params.page, 10) : 1;
  const pageSize = params.pageSize ? parseInt(params.pageSize, 10) : 10;
  const roleId = params.roleId && params.roleId !== "all" ? parseInt(params.roleId, 10) : null;
  const name = params.name || null;

  let users: UserItem[] = [];
  let totalCount = 0;

  try {
    const res = await getUsers(page, pageSize, roleId, name);
    if (res?.data?.items && Array.isArray(res.data.items)) {
      users = res.data.items;
      totalCount = res.data.totalCount;
    } else if (res?.data && Array.isArray(res.data)) {
      users = res.data;
      totalCount = res.data.length;
    }
  } catch (error) {
  }

  return (
    <div className="py-2">
      <UsersTable
        initialUsers={users}
        initialTotalCount={totalCount}
        initialPage={page}
        initialPageSize={pageSize}
        initialRoleId={roleId ? String(roleId) : "all"}
        initialSearch={name || ""}
      />
    </div>
  );
}
