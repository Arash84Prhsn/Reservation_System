import Calendar from "@/features/home/components/HomeCalendar";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Next.js Calender | TailAdmin - Next.js Dashboard Template",
  description:
    "This is Next.js Calender page for TailAdmin  Tailwind CSS Admin Dashboard Template",
  // other metadata
};
export default function page() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Calendar" />
      <div className="min-h-screen w-full overflow-hidden">
        <div className="mx-auto max-w-7xl p-4">
          <Calendar />
        </div>
      </div>
    </div>
  );
}
