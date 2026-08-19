import { HttpError } from "@/shared/lib/api/core/errors";
import { apiFetch } from "@/shared/lib/api/core/http";

// ─── Types: Reservation ───────────────────────────────────────
export type ReservationSystemOnly = "only running programs" | "dorsan desk";
export const SYSTEM_ONLY_TYPES: ReservationSystemOnly[] = [
  "only running programs",
  "dorsan desk",
];
export type ReservationSeatAndSystem = "internship" | "project";

export type ReservationType = ReservationSeatAndSystem | ReservationSystemOnly;

export type SeatType = "dotin" | "optimization" | "laptop" | "manager";

export interface ReservationInfo {
  reservation_date: string;
  reservation_type: ReservationType;
  start_time: string;
  end_time: string;
  seat_type: SeatType;
  seat_number: number;
}

export interface Warning {
  needed: boolean;
  conflict_intervals: { start_time: string; end_time: string }[];
  warning_message: string;
}

export interface ReservationResponse {
  message: string;
  reservation_info: ReservationInfo;
  success: boolean;
  warning: Warning;
}

// ─── Types: Schedule Timeslots (Mobile) ───────────────────────
export type ScheduleSlotStatus =
  | "free"
  | "reserved_by_user"
  | "reserved_by_user_with_system_reservation"
  | "reserved_by_others"
  | "reserved_by_others_with_system_reservation"
  | "event"; // event is lab meeting (technicaly "disabled").

export interface ScheduleSlot {
  timeslot_number: number;
  start_time: string;
  end_time: string;
  status: ScheduleSlotStatus;
  reservation_type: ReservationType;
  reserved_by: number; // user id
}

export interface ScheduleTimeslotDay {
  date: string; // YYYY-MM-DD
  slots: ScheduleSlot[];
}

export interface WeeklyScheduleTimeslotsInput {
  date: string; // YYYY-MM-DD
  seat_type: SeatType;
  seat_number: number;
}
export interface WeeklyScheduleTimeslotsResponse {
  success: true;
  message?: string;
  schedule: ScheduleTimeslotDay[];
}

// ─── Types: Open Dates ────────────────────────────────────────
export interface OpenDatesForUserResponse {
  success: true;
  message?: string;
  dates: string[];
}

// ─── Types: Final Reservation ─────────────────────────────────
export type FinalReservationSubmissionInput = ReservationInfo;

export interface FinalReservationSubmissionResponse {
  success: boolean;
  message: string;
}

// ─── Types: Current Week Schedule (Desktop) ───────────────────
export interface CurrentWeekScheduleIntervalsInput {
  seat_type: SeatType;
  seat_number: number;
}

export interface ReservationItem {
  start_time: string;
  end_time: string;
  reservation_type: ReservationType;
  reserved_by: number;
  reservation_id: number;
}

export interface EventItem {
  start_time: string;
  end_time: string;
}

export interface ScheduleIntervalDay {
  date: string;
  events: EventItem[];
  reservations: ReservationItem[];
}

export interface CurrentWeekScheduleIntervalsResponse {
  success: boolean;
  dates: ScheduleIntervalDay[];
}

// ─── Types: Weekly Schedule (Desktop) ─────────────────────────
export interface WeeklyScheduleIntervalsInput extends CurrentWeekScheduleIntervalsInput {
  date: string;
}

export interface WeeklyScheduleIntervalsResponse extends CurrentWeekScheduleIntervalsResponse {
  message?: string;
}

// ─── Types: User Active Reservations ──────────────────────────
export interface ActiveReservations {
  reservation_id: number;
  date: string;
  day_of_week: number;
  reservation_type: ReservationType;
  start_time: string;
  end_time: string;
  seat_type: string;
  seat_number: number;
}
export interface GetUserActiveReservationsResponse {
  success: boolean;
  message?: string;
  reservations: ActiveReservations[];
}

// ─── Types: Cancel Reservation ────────────────────────────────

export interface CancelReservationByIdResponse {
  success: boolean;
  message: string;
}

// ─── API Functions ────────────────────────────────────────────

/**
 * Step 1: Pre-validate a reservation before final submission.
 */
export async function make_reservation(input: ReservationInfo) {
  const res = await apiFetch<ReservationResponse>(
    "/reservation/make_reservation",
    {
      method: "POST",
      body: input,
    },
  );
  // if api status is 2xx but success is false throw err.
  if (!res.success) {
    throw new HttpError(res.message || "رزرو ناموفق بود", 400, res);
  }

  return res;
}

/**
 * Fetch available time slots for a specific day and seat (Mobile View).
 */
export async function weekly_schedule_timeslots(
  input: WeeklyScheduleTimeslotsInput,
) {
  // TODO: report to backend and fix the API response type. (data instead of schedule)
  const res = await apiFetch<WeeklyScheduleTimeslotsResponse>(
    "reservation/weekly_schedule_timeslots",
    {
      method: "POST",
      body: input,
    },
  );

  // if api status is 2xx but success is false throw err.
  if (!res.success) {
    throw new HttpError(res.message || "خطا در دریافت اسلات‌های زمانی", 400, res);
  }

  return res;
}

/**
 * Fetch dates that have available slots for a specific seat type.
 */
export async function open_dates_for_user(seat_type: SeatType) {
  const res = await apiFetch<OpenDatesForUserResponse>(
    "/reservation/open_dates_for_user",
    {
      method: "POST",
      body: { seat_type },
    },
  );

  // if api status is 2xx but success is false throw err.
  if (!res.success) {
    throw new HttpError(res.message || "دریافت روز های قابل رزرو ناموفق بود", 400, res);
  }
  return res;
}

/**
 * Step 2: Finalize and submit the reservation.
 */
export async function final_reservation_submission(
  input: FinalReservationSubmissionInput,
) {
  const res = await apiFetch<FinalReservationSubmissionResponse>(
    "/reservation/final_reservation_submission",
    {
      method: "POST",
      body: input,
    },
  );

  // if api status is 2xx but success is false throw err.
  if (!res.success) {
    throw new HttpError(
      res.message || "خطا در ثبت نهایی رزرو",
      400,
      res,
    );
  }
  return res;
}

/**
 * Fetch the schedule intervals for the current week (Desktop View).
 */
export async function current_week_schedule_intervals(
  input: CurrentWeekScheduleIntervalsInput,
) {
  const res = await apiFetch<CurrentWeekScheduleIntervalsResponse>(
    "/reservation/current_week_schedule_intervals",
    {
      method: "POST",
      body: input,
    },
  );

  // if api status is 2xx but success is false throw err.
  if (!res.success) {
    throw new HttpError("خطا در دریافت اسلات‌های زمانی هفته جاری", 400, res);
  }

  return res;
}

/**
 * Fetch the schedule intervals for a specific week (Desktop View).
 */
export async function weekly_schedule_intervals(
  input: WeeklyScheduleIntervalsInput,
) {
  const res = await apiFetch<WeeklyScheduleIntervalsResponse>(
    "/reservation/weekly_schedule_intervals",
    {
      method: "POST",
      body: input,
    },
  );

  // if api status is 2xx but success is false throw err.
  if (!res.success) {
    throw new HttpError(res.message || "خطا در دریافت رزروه های هفته خواسته شده", 400, res);
  }

  return res;
}

/**
 * Fetch all active reservations for the currently logged-in user.
 */
export async function get_user_active_reservations() {
  const res = await apiFetch<GetUserActiveReservationsResponse>(
    "/reservation/get_user_active_reservations",
    {
      method: "GET",
    },
  );
  // if api status is 2xx but success is false throw err.
  if (!res.success) {
    throw new HttpError(res.message || "خطا در دریافت رزرو های فعال", 400, res);
  }

  return res;
}

/**
 * Cancel a specific reservation by ID.
 */
export async function cancel_reservation_by_id(reservation_id: number) {
  const res = await apiFetch<CancelReservationByIdResponse>(
    "/reservation/cancel_reservation_by_id",
    {
      method: "PUT",
      body: {
        reservation_id,
      },
    },
  );

  // if api status is 2xx but success is false throw err.
  if (!res.success) {
    throw new HttpError(res.message || "خطا در حذف رزرو", 400, res);
  }

  return res;
}
