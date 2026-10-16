"use client";

import React from "react";
import { useSidebar } from "@/context/SidebarContext";
import { UserProvider } from "@/context/UserContext";
import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";
import Backdrop from "@/layout/Backdrop";
import { UserProfile } from "@/types/user";

interface AdminLayoutClientProps {
  children: React.ReactNode;
  initialUser: UserProfile | null;
}

export default function AdminLayoutClient({
  children,
  initialUser,
}: AdminLayoutClientProps) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  // Dynamic class for main content margin based on sidebar state in RTL
  const mainContentMargin = isMobileOpen
    ? "mr-0"
    : isExpanded || isHovered
    ? "lg:mr-[290px]"
    : "lg:mr-[90px]";

  return (
    <UserProvider initialUser={initialUser}>
      <div className="min-h-screen xl:flex bg-[#EEF0E6] dark:bg-gray-900">
        {/* Sidebar and Backdrop */}
        <AppSidebar />
        <Backdrop />
        {/* Main Content Area */}
        <div
          className={`flex-1 transition-all duration-300 ease-in-out ${mainContentMargin}`}
        >
          {/* Header */}
          <AppHeader />
          {/* Page Content */}
          <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">
            {children}
          </div>
        </div>
      </div>
    </UserProvider>
  );
}
