"use client";
import { useState } from "react";
import ColorLegend from "@/features/home/components/ColorLegend";
import { useSidebar } from "@/context/SidebarContext";
import SeatMap from "@/features/home/components/seat-map";
import { SeatType } from "@/lib/api/services/reservation.service";
import SeatList from "@/features/home/components/SeatList";
import HomeCalendar from "@/features/home/components/HomeCalendar";
import ReserveList from "@/features/home/components/ReserveList";
export interface DesktopSeat {
  type: SeatType;
  number: number;
}

export default function Ecommerce() {
  const { isMobile } = useSidebar();
  const [seat, setSeat] = useState<DesktopSeat | null>(null);

  const onChairSelect = (inputSeat: DesktopSeat) => {
    setSeat(inputSeat);
  };

  return (
    <div>
      {/* mobile: */}

      {isMobile ? (
        <div>
          <SeatMap />
          <ColorLegend />
        </div>
      ) : (
        // Desktop:

        <div className="flex justify-end gap-5">
          <ReserveList />

          {/* if chair is not selected, don't show calendar */}
          {seat && <HomeCalendar seat={seat} />}

          <SeatList seat={seat} onChairSelect={onChairSelect} />

          {/* fixed color guidence */}
          <ColorLegend />
        </div>
      )}
    </div>
  );
}
