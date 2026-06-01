"use client";
import Calendar from "@/components/calendar/Calendar";
import ChairList from "@/features/home/components/ChairList";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { CalendarEvent, ChairState } from "../type";
import ColorLegend from "@/features/home/components/ColorLegend";
import ReserveList from "@/features/home/components/ReserveList";
import { useSidebar } from "@/context/SidebarContext";
import SeatMap from "@/features/home/components/seat-map";
import { useRouter } from "next/navigation";

export default function Ecommerce() {
  const { isMobile } = useSidebar();
  const { user, isUserInitialized } = useAuth();
  const [chair, setChair] = useState<ChairState | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  // initial events
  useEffect(() => {
    const today = new Date();

    setEvents([
      {
        id: "1",
        title: "Event Conf.",
        start: new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
          9,
          0,
        ).toISOString(),

        end: new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
          9,
          30,
        ).toISOString(),

        allDay: false,

        extendedProps: {
          calendar: "Danger",
          chair: {
            chairNumber: 1,
            chairType: "A",
          },
        },
      },
    ]);
  }, []);

  // if user is NOT logged-in, go to sign-in page.

  const router = useRouter();

  // useEffect(() => {
  //   logout();
  // }, []);

  useEffect(() => {
    if (!isUserInitialized) return;
    if (!user) router.replace("/signin");
  }, [user, router, isUserInitialized]);

  if (!user || !isUserInitialized) {
    return <div>Loading </div>;
  }

  const onChairSelect = (
    chairType: ChairState["chairType"],
    chairNumber: number,
  ) => {
    const newChair: ChairState = { chairType, chairNumber };
    setChair(newChair);
  };

  return (
    <div>
      {isMobile ? (
        <div>
          <SeatMap />
          <ColorLegend />
        </div>
      ) : (
        //mobile

        // Desktop
        <div className="flex justify-end gap-5">
          <ReserveList events={events} />

          {/* if chair is not selected, don't show calendar */}
          {chair && (
            <Calendar chair={chair} events={events} onAddEvent={setEvents} />
          )}

          <ChairList chair={chair} onChairSelect={onChairSelect} />

          {/* fixed color guidence */}
          <ColorLegend />
        </div>
      )}
    </div>
  );
}
