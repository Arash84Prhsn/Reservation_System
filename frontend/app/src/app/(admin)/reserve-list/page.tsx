import ReserveList from "@/features/reservation/components/desktop/ReserveList";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "رزروهای من",
  description: "مشاهده و مدیریت رزروهای فعال کاربر.",
};

export default function ReserveListPage() {
  return (
    <div className="flex flex-col">
      <ReserveList />
    </div>
  );
}
