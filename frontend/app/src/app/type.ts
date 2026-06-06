import { EventInput } from "@fullcalendar/core/index.js";
import { DesktopSeat } from "./(admin)/page";

export interface CalendarEvent extends EventInput {
  extendedProps?: {
    // calendar?: string;
    seat?: DesktopSeat;
    type?: "reservation" | "event";
    reservedBy?: number;
    reservationType?: string;
  };
}
