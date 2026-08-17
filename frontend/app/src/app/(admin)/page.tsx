"use client";
import { Suspense, useState } from "react";
import ColorLegend from "@/features/reservation/components/shared/ColorLegend";
import { useSidebar } from "@/shared/context/SidebarContext";
import SeatMap from "@/features/reservation/components/mobile";
import SeatList from "@/features/reservation/components/desktop/SeatList";
import HomeCalendar from "@/features/reservation/components/desktop/HomeCalendar";
import ReserveList from "@/features/reservation/components/desktop/ReserveList";
import { DesktopSeat } from "@/features/reservation/types";

export default function HomePage() {
  const { isMobile } = useSidebar();
  const [seat, setSeat] = useState<DesktopSeat | null>(null);

  const onChairSelect = (inputSeat: DesktopSeat) => {
    setSeat(inputSeat);
  };

  const seatIsNotSelectedMessage = (
    <div className="w-full h-full flex justify-center items-center border border-gray-200 rounded-2xl bg-white/90 p-6 shadow-sm backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/90" dir="rtl">
      <div className="text-center">
        <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-blue-50 text-blue-600 text-3xl mb-3 dark:bg-blue-950/40 dark:text-blue-400">
          💺
        </div>
        <p className="text-xl font-bold text-gray-800 dark:text-gray-100">
          ابتدا صندلی مورد نظر خود را انتخاب کنید
        </p>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          از لیست سمت راست، یکی از صندلی‌های آزمایشگاه را انتخاب نمایید تا برنامه هفتگی نمایش داده شود
        </p>
      </div>
    </div>
  );

  return (
    <div className="w-full">
      {isMobile ? (
        <Suspense
          fallback={
            <div className="flex h-64 items-center justify-center">
              <p className="fa text-gray-500">در حال بارگذاری نقشه صندلی‌ها...</p>
            </div>
          }
        >
          <SeatMap />
        </Suspense>
      ) : (
        <div className="flex items-start gap-4 h-[calc(100vh-130px)] w-full overflow-hidden">
          {/* Left Column: Reserve List */}
          <ReserveList />

          {/* Center Column: Calendar or Empty Message */}
          <div className="flex-1 min-w-0 h-full overflow-hidden">
            {seat ? <HomeCalendar seat={seat} /> : seatIsNotSelectedMessage}
          </div>

          {/* Right Column: Seat List */}
          <SeatList seat={seat} onChairSelect={onChairSelect} />
        </div>
      )}
      <ColorLegend />
    </div>
  );
}
