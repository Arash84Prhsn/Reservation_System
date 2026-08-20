import { CalendarEvent } from "@/features/reservation/types";
import { ScheduleIntervalDay } from "../api";
import { getReservationTypeLabel } from "@/features/reservation/config/reservation-options";

export function mapScheduleIntervalsToCalendarEvents(
  scheduleIntervals: ScheduleIntervalDay[],
): CalendarEvent[] {
  return scheduleIntervals.flatMap((day) => {
    const reservationEvents: CalendarEvent[] = day.reservations.map(
      (reservation) => ({
        id: `reservation-${reservation.reservation_id}`,
        title: getReservationTypeLabel(reservation.reservation_type),
        start: `${day.date}T${reservation.start_time}`,
        end: `${day.date}T${reservation.end_time}`,
        allDay: false,
        extendedProps: {
          // calendar: "Danger",
          reservedBy: reservation.reserved_by,
          reservationType: reservation.reservation_type,
          type: "reservation",
          reservationId: reservation.reservation_id,
        },
      }),
    );

    const systemEvents: CalendarEvent[] = day.events.map((event, index) => ({
      id: `event-${day.date}-${index}`,
      title: "رویداد آزمایشگاه",
      start: `${day.date}T${event.start_time}`,
      end: `${day.date}T${event.end_time}`,
      allDay: false,
      extendedProps: {
        type: "event",
        // calendar: "Warning",
      },
    }));

    return [...reservationEvents, ...systemEvents];
  });
}
