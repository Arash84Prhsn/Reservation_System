import HomeCalendar from "@/features/reservation/components/desktop/HomeCalendar";
import PageBreadcrumb from "@/shared/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "تقویم رزرو | پنل مدیریت",
  description: "مشاهده تقویم و برنامه‌ریزی رزرو میز و صندلی",
};
export default function page() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Calendar" />
      <div className="min-h-screen w-full overflow-hidden">
        <HomeCalendar />
      </div>
    </div>
  );
}
