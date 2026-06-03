"use client";
import Calendar from "@/components/calendar/Calendar";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useMemo, useState } from "react";
import ColorLegend from "@/features/home/components/ColorLegend";
import ReserveList from "@/features/home/components/ReserveList";
import { useSidebar } from "@/context/SidebarContext";
import SeatMap from "@/features/home/components/seat-map";
import { useRouter } from "next/navigation";
import BottomNavBar from "@/layout/BottomNavBar";
import { SeatType } from "@/lib/api/services/reservation.service";
import { mapScheduleIntervalsToCalendarEvents } from "@/features/home/components/mapScheduleIntervalsToCalendarEvents";
import SeatList from "@/features/home/components/SeatList";
import useWeeklyScheduleIntervals from "@/features/home/hooks/use-weekly-schedule-intervals";
import { DateObject } from "react-multi-date-picker";

export interface DesktopSeat {
  type: SeatType;
  number: number;
}

export default function Ecommerce() {
  const { isMobile } = useSidebar();
  const { user, isUserInitialized } = useAuth();
  const [seat, setSeat] = useState<DesktopSeat | null>(null);
  const [selectedWeekDate, setSelectedWeekDate] = useState<string>(
    new DateObject().format("YYYY-MM-DD"),
  );

  const router = useRouter();

  // TODO: Add refetch
  // const { scheduleIntervals, loading, error } = useCurrentWeekScheduleIntervals(
  //   {
  //     seatType: seat?.type,
  //     seatNumber: seat?.number,
  //   },
  // );

  const { scheduleIntervals, loading, error } = useWeeklyScheduleIntervals({
    seatType: seat?.type,
    seatNumber: seat?.number,
    date: selectedWeekDate, // <— dynamic!
  });

  const events = useMemo(() => {
    return mapScheduleIntervalsToCalendarEvents(scheduleIntervals);
  }, [scheduleIntervals]);

  const handleNextWeekOrPreviousWeekClicked = (date: string) => {
    console.log("Parent received new week date:", date);
    setSelectedWeekDate(date);
  };

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
      {isMobile ? (
        <div>
          <SeatMap />
          <ColorLegend />
          <BottomNavBar />
        </div>
      ) : (
        //mobile

        // Desktop
        <div className="flex justify-end gap-5">
          <ReserveList events={events} />

          {/* if chair is not selected, don't show calendar */}
          {seat && (
            <Calendar
              seat={seat}
              events={events}
              onChangeWeekClick={(date) =>
                handleNextWeekOrPreviousWeekClicked(date)
              }
            />
          )}

          {/* Improve UX */}
          {/* {improveUX} */}

          <SeatList seat={seat} onChairSelect={onChairSelect} />

          {/* fixed color guidence */}
          <ColorLegend />
        </div>
      )}
    </div>
  );
}
