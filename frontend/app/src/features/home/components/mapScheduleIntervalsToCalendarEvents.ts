import { CalendarEvent } from "@/app/type";
import { ScheduleIntervalDay } from "@/lib/api/services/reservation.service";

export function mapScheduleIntervalsToCalendarEvents(
  scheduleIntervals: ScheduleIntervalDay[],
): CalendarEvent[] {
  return scheduleIntervals.flatMap((day) => {
    const reservationEvents: CalendarEvent[] = day.reservations.map(
      (reservation, index) => ({
        id: `reservation-${day.date}-${index}`,
        title: reservation.reservation_type,
        start: `${day.date}T${reservation.start_time}`,
        end: `${day.date}T${reservation.end_time}`,
        allDay: false,
        extendedProps: {
          // calendar: "Danger",
          reservedBy: reservation.reserved_by,
          reservationType: reservation.reservation_type,
          type: "reservation",
        },
      }),
    );

    const systemEvents: CalendarEvent[] = day.events.map((event, index) => ({
      id: `event-${day.date}-${index}`,
      title: "Event",
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
