"use client";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import ColorLegend from "@/features/home/components/ColorLegend";
import { useSidebar } from "@/context/SidebarContext";
import SeatMap from "@/features/home/components/seat-map";
import { useRouter } from "next/navigation";
import BottomNavBar from "@/layout/BottomNavBar";
import { SeatType } from "@/lib/api/services/reservation.service";
import SeatList from "@/features/home/components/SeatList";
import HomeCalendar from "@/features/home/components/HomeCalendar";

export interface DesktopSeat {
  type: SeatType;
  number: number;
}

export default function Ecommerce() {
  const { isMobile } = useSidebar();
  const { user, isUserInitialized } = useAuth();
  const [seat, setSeat] = useState<DesktopSeat | null>(null);

  const router = useRouter();

  // if user is NOT logged-in, go to sign-in page.
  useEffect(() => {
    if (!isUserInitialized) return;
    if (!user) router.replace("/signin");
  }, [user, router, isUserInitialized]);

  if (!user || !isUserInitialized) {
    return <div>Loading </div>;
  }

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
          <BottomNavBar />
        </div>
      ) : (
        // Desktop:

        <div className="flex justify-end gap-5">
          {/* <ReserveList /> */}

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
