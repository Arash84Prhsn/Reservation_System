/**
 * Reservation Feature — Shared Types
 *
 * All types that are used across multiple components in the reservation feature
 * live here. This prevents circular dependencies and keeps types centralized.
 */

import { EventInput } from "@fullcalendar/core/index.js";
import { SeatType } from "../api";

// ─── Desktop Seat ─────────────────────────────────────────
/**
 * Represents a seat selected by the user on the desktop view (SeatList).
 * Used to pass the selected seat to HomeCalendar and API calls.
 */
export interface DesktopSeat {
  type: SeatType;
  number: number;
}

// ─── Calendar Event ───────────────────────────────────────
/**
 * Extended FullCalendar event with reservation-specific metadata.
 * Used to render events in the desktop calendar view.
 */
export interface CalendarEvent extends EventInput {
  extendedProps?: {
    seat?: DesktopSeat;
    type?: "reservation" | "event";
    reservedBy?: number;
    reservationType?: string;
    reservationId?: number;
  };
}
