/**
 * Reservation Feature — Configuration Constants
 *
 * Centralized reservation option lists and label maps.
 * Previously duplicated in HomeCalendar.tsx and SeatDetailPanel.tsx.
 */

import { ReservationType } from "@/lib/api/services/reservation.service";

// ─── Reservation Type Options ─────────────────────────────

export type ReservationOption = {
  value: ReservationType;
  label: string;
};

/**
 * Options available for PC-type seats (dotin, optimization).
 * These seats have physical hardware + system, so they support
 * both system-only and physical reservation types.
 */
export const PC_RESERVATION_OPTIONS: ReservationOption[] = [
  { value: "only running programs", label: "محاسبات" },
  { value: "dorsan desk", label: "درسان دسک" },
  { value: "internship", label: "کارآموزی" },
  { value: "project", label: "پروژه" },
];

/**
 * Options available for laptop-type seats.
 * Laptop seats don't have dedicated systems, so system-only
 * reservation types are not available.
 */
export const LAPTOP_RESERVATION_OPTIONS: ReservationOption[] = [
  { value: "internship", label: "کارآموزی" },
  { value: "project", label: "پروژه" },
];

// ─── Reservation Type Label Map ───────────────────────────

/** Maps reservation type API values to their Persian display labels. */
export function getReservationTypeLabel(type: string | null | undefined): string {
  switch (type) {
    case "only running programs":
      return "محاسبات";
    case "dorsan desk":
      return "درسان دسک";
    case "internship":
      return "کارآموزی";
    case "project":
      return "پروژه";
    default:
      return "انتخاب نشده";
  }
}

/** Maps seat type API values to their Persian display labels. */
export function getSeatTypeLabel(type: string | null | undefined): string {
  switch (type) {
    case "dotin":
      return "داتین";
    case "optimization":
      return "بهینه‌سازی";
    case "laptop":
      return "لپ‌تاپ";
    case "manager":
      return "مدیر";
    default:
      return type || "نامشخص";
  }
}
