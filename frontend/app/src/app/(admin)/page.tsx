"use client";
import { Suspense, useState } from "react";
import ColorLegend from "@/features/reservation/components/shared/ColorLegend";
import { useSidebar } from "@/shared/context/SidebarContext";
import SeatMap from "@/features/reservation/components/mobile";
import SeatList from "@/features/reservation/components/desktop/SeatList";
import HomeCalendar from "@/features/reservation/components/desktop/HomeCalendar";
import ReserveList from "@/features/reservation/components/desktop/ReserveList";
import { DesktopSeat } from "@/features/reservation/types";

export default function Ecommerce() {
  const { isMobile } = useSidebar();
  const [seat, setSeat] = useState<DesktopSeat | null>(null);

  const onChairSelect = (inputSeat: DesktopSeat) => {
    setSeat(inputSeat);
  };

  const seatIsNotSelectedMessage = (
    <div className="w-full flex justify-center items-center border rounded-2xl  bg-res-green-100 h-[calc(100vh-130px)]">
      <p className="text-4xl">ابتدا صندلی خود را انتخاب کنید</p>
    </div>
  );

  return (
    <div>
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
        <div className="flex justify-end gap-5  h-[calc(100vh-130px)]">
          <ReserveList />

          {/* if chair is not selected, don't show calendar */}
          {seat ? <HomeCalendar seat={seat} /> : seatIsNotSelectedMessage}

          <SeatList seat={seat} onChairSelect={onChairSelect} />

          {/* fixed color guidence */}
        </div>
      )}
      <ColorLegend />
    </div>
  );
}
