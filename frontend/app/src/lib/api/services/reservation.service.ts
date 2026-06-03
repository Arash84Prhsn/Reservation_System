import { toast } from "sonner";
import { apiFetch } from "../core/http";
import { ApiResponse } from "./auth.servise";
import { HttpError } from "../core/errors";

// type: reservation
export type ReservationType =
  | "only running programs"
  | "internship"
  | "project"
  | "dorsan desk";

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
  warning: Warning;
  reservation_info: ReservationInfo;
}

// type: schedule timeslots for a week (mobile)
export type ScheduleSlotStatus = "free" | "reserved" | "mine" | "event"; // event is lab meeting (technicaly "disabled").

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

// type: dates that user can reserve.
export interface OpenDatesForUserResponse {
  success: true;
  message?: string;
  dates: string[];
}

// type: final reservation submission
export interface FinalReservationSubmissionInput {
  reservation_date: string;
  reservation_type: ReservationType;
  start_time: string;
  end_time: string;
  seat_type: SeatType;
  seat_number: number;
}
export interface FinalReservationSubmissionResponse {
  success: boolean;
  message: string;
}

// type: current week schedule intervals (desktop)
export interface CurrentWeekScheduleIntervalsInput {
  seat_type: SeatType;
  seat_number: number;
}

export interface ReservationItem {
  start_time: string;
  end_time: string;
  reservation_type: ReservationType;
  reserved_by: number;
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

// type: weekly schedule intervals (desktop)
export interface WeeklyScheduleIntervalsInput extends CurrentWeekScheduleIntervalsInput {
  date: string;
}

export interface WeeklyScheduleIntervalsResponse extends CurrentWeekScheduleIntervalsResponse {
  message?: string;
}

//API functions
// make reservation API
export async function make_reservation(input: ReservationInfo) {
  const res = await apiFetch<ApiResponse<ReservationResponse>>(
    "/reservation/make_reservation",
    {
      method: "POST",
      body: input,
    },
  );
  // if api status is 2xx but success is false throw err.
  if (!res.success) {
    toast.error(res.message || "رزرو ناموفق بود");
    throw new HttpError(res.message || "Login failed", 400, res);
  }

  return res;
}

// time slot for a week (mobile) API
export async function weekly_schedule_timeslots(
  input: WeeklyScheduleTimeslotsInput,
) {
  //TODO: report to backend and fix the API response type. (data instead of schedule)
  const res = await apiFetch<WeeklyScheduleTimeslotsResponse>(
    "reservation/weekly_schedule_timeslots",
    {
      method: "POST",
      body: input,
    },
  );

  // if api status is 2xx but success is false throw err.
  if (!res.success) {
    toast.error(res.message || "خطا در دریافت اسلات‌های زمانی");
    throw new HttpError(res.message || "Failed to fetch time slots", 400, res);
  }

  return res;
}

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
    toast.error(res.message || "دریافت روز های قابل رزرو ناموفق بود");
    throw new HttpError(res.message || "Login failed", 400, res);
  }
  return res;
}

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
    toast.error(res.message || "خطا در ثبت نهایی رزرو");
    throw new HttpError(
      res.message || "Final reservation submission failed",
      400,
      res,
    );
  }
  return res;
}

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
    toast.error("خطا در دریافت اسلات‌های زمانی هفته جاری");
    throw new HttpError("Failed to fetch time slots", 400, res);
  }

  return res;
}

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
    toast.error(res.message || "خطا در دریافت رزروه های هفته خواسته شده");
    throw new HttpError("Failed to fetch intervals", 400, res);
  }

  return res;
}
