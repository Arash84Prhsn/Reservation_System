"use client";

import React, { useEffect } from "react";
import ReserveList from "@/features/reservation/components/desktop/ReserveList";
import { NextPage } from "next";
import { useSidebar } from "@/shared/context/SidebarContext";
import { useRouter } from "next/navigation";

const ReserveListPage: NextPage = () => {
  const { isMobile } = useSidebar();
  const router = useRouter();

  useEffect(() => {
    if (!isMobile) {
      router.replace("/");
    }
  }, [isMobile, router]);

  if (!isMobile) {
    return null;
  }

  return (
    <div className="flex flex-col">
      <ReserveList />
    </div>
  );
};

export default ReserveListPage;
