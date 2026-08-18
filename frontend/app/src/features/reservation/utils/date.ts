/**
 * Reservation Feature — Date Utilities
 *
 * Centralized date/time helpers used across the reservation feature.
 * Handles Persian (Jalali) ↔ Gregorian conversions and formatting.
 *
 * Dependencies:
 *  - react-multi-date-picker's DateObject for calendar-aware operations
 *  - react-date-object for Persian/Gregorian calendar and locale support
 */

import { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import gregorian from "react-date-object/calendars/gregorian";
import gregorian_en from "react-date-object/locales/gregorian_en";

// ─── Working Hours Constants ──────────────────────────────
export const WORKING_START_MINUTES = 8 * 60; // 08:00
export const WORKING_END_MINUTES = 14 * 60; // 14:00

// ─── Conversion Helpers ───────────────────────────────────

/**
 * Converts a JS Date to a Persian DateObject.
 * Used by FullCalendar event handlers which give us native Date objects.
 */
export const toPersianDateObject = (date: Date) => {
  return new DateObject({
    date,
    calendar: persian,
    locale: persian_fa,
  });
};

/**
 * Converts a Gregorian date string (e.g. "2026-08-13") to a Persian DateObject.
 * Used when we have API dates (Gregorian) and need to display them in Jalali.
 */
export const dateStringToPersianDateObject = (date: string) => {
  return new DateObject({
    date,
    calendar: gregorian,
    locale: gregorian_en,
  }).convert(persian, persian_fa);
};

/**
 * Merges a date DateObject with a time DateObject,
 * producing a new DateObject with the date's calendar date and the time's hours/minutes.
 */
export const mergeDateAndTime = (date: DateObject, time: DateObject) => {
  return new DateObject(date).set({
    hour: time.hour,
    minute: time.minute,
    second: 0,
    millisecond: 0,
  });
};

/**
 * Merges a date DateObject with a time string (e.g. "08:30"),
 * producing a new DateObject with the combined date and time.
 */
export const mergeDateAndTimeString = (date: DateObject, time: string) => {
  const [hour, minute] = time.split(":").map(Number);

  return new DateObject(date).set({
    hour,
    minute,
    second: 0,
    millisecond: 0,
  });
};

// ─── Time Arithmetic ──────────────────────────────────────

/** Converts a DateObject's time part to total minutes since midnight. */
export const getTimeInMinutes = (time: DateObject) => {
  return time.hour * 60 + time.minute;
};

/** Returns true if the given time falls within the lab's working hours (08:00 – 14:00). */
export const isWithinWorkingHours = (time: DateObject) => {
  const minutes = getTimeInMinutes(time);
  return minutes >= WORKING_START_MINUTES && minutes <= WORKING_END_MINUTES;
};

/** Returns true if endTime is strictly after startTime. */
export const isEndAfterStart = (startTime: DateObject, endTime: DateObject) => {
  return getTimeInMinutes(endTime) > getTimeInMinutes(startTime);
};

// ─── API Formatting ───────────────────────────────────────

/**
 * Formats a Persian DateObject to a Gregorian "YYYY-MM-DD" string for API calls.
 * The API expects Gregorian dates, while the UI shows Jalali.
 */
export const formatDateForApi = (date: DateObject) => {
  return new DateObject(date)
    .convert(gregorian, gregorian_en)
    .format("YYYY-MM-DD");
};

/**
 * Formats a DateObject's time part to "HH:mm" in English digits for API calls.
 * We manually construct the string to avoid Persian numeral output.
 */
export const formatTimeForApi = (time: DateObject) => {
  const hour = String(time.hour).padStart(2, "0");
  const minute = String(time.minute).padStart(2, "0");
  return `${hour}:${minute}`;
};

// ─── Persian Display Formatting ───────────────────────────

const PERSIAN_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

/** Converts a "HH:mm" or "HH:mm:ss" time string to Persian digits (strips seconds). */
export const formatPersianTime = (timeString: string) => {
  const timeWithoutSeconds = timeString.split(":").slice(0, 2).join(":");
  return timeWithoutSeconds.replace(
    /\d/g,
    (digit) => PERSIAN_DIGITS[parseInt(digit)],
  );
};

/** Converts a Gregorian date string to a formatted Persian date (YYYY/MM/DD in Farsi digits). */
export const formatPersianDate = (dateString: string) => {
  const persianDate = dateStringToPersianDateObject(dateString);
  return persianDate.format("YYYY/MM/DD");
};

// ─── Calendar Initialization ──────────────────────────────

/**
 * Returns the initial date for the FullCalendar view.
 * If today is Thursday or Friday (weekend in Persian calendar),
 * jump ahead to next Saturday so users see the upcoming work week.
 */
export function getInitialPersianWeekDate(): Date {
  const today = new Date();
  const dow = today.getDay(); // 0 = Sun, 4 = Thu, 5 = Fri, 6 = Sat

  if (dow >= 4 && dow <= 5) {
    const nextWeekSaturday = new Date(today);
    const daysUntilSaturday = (6 - dow + 7) % 7 || 7;
    nextWeekSaturday.setDate(today.getDate() + daysUntilSaturday);
    return nextWeekSaturday;
  }

  return today;
}
