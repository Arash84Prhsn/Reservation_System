"use client";

import { useAuth } from "@/context/AuthContext";
import { useSidebar } from "@/context/SidebarContext";
import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";
import Backdrop from "@/layout/Backdrop";
import MobileBottomNavBar from "@/layout/MobileBottomNavBar";
import MobileTopBar from "@/layout/MobileTopBar";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isExpanded, isHovered, isMobileOpen, isMobile } = useSidebar();
  const { user, isUserInitialized } = useAuth();
  const router = useRouter();

  // if user is NOT logged-in, go to sign-in page.
  useEffect(() => {
    if (!isUserInitialized) return;
    if (!user) router.replace("/signin");
  }, [user, router, isUserInitialized]);

  if (!user || !isUserInitialized) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <svg className="h-10 w-10 animate-spin text-res-green-success" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="fa text-lg font-medium text-gray-500">در حال بررسی اطلاعات کاربری...</p>
        </div>
      </div>
    );
  }

  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
      ? "lg:mr-[290px]"
      : "lg:mr-[90px]";

  return (
    <div className="md:min-h-screen xl:flex">
      {/* Sidebar and Backdrop */}
      <AppSidebar />
      <Backdrop />
      {/* Main Content Area */}
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${mainContentMargin} ${isMobile && "mb-16"}`}
      >
        {/* Header */}
        {isMobile ? <MobileTopBar /> : <AppHeader />}

        {/* Page Content */}

        <div
          className={`mx-auto max-w-(--breakpoint-2xl) p-4 md:p-6 ${isMobile && "mt-12"} `}
        >
          {children}
        </div>
      </div>
      {isMobile && <MobileBottomNavBar />}
    </div>
  );
}
