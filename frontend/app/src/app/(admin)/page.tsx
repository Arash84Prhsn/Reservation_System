"use client";
import Calendar from "@/components/calendar/Calendar";
import ChairList from "@/components/home/ChairList";
// import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { CalendarEvent, ChairState } from "../type";
import ColorLegend from "@/components/home/ColorLegend";
import ReserveList from "@/components/home/ReserveList";
import { useSidebar } from "@/context/SidebarContext";
import SeatMap from "@/components/home/seat-map";

export default function Ecommerce() {
  const { isMobile } = useSidebar();
  // const { user } = useAuth();
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

  // const router = useRouter();

  // useEffect(() => {
  //   logout();
  // }, []);

  // useEffect(() => {
  //   if (!user) {
  //     router.replace("/signin");
  //   }
  // }, [user, router]);

  // if (!user) {
  //   return <div>Loading </div>; // Or return null;
  // }

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
