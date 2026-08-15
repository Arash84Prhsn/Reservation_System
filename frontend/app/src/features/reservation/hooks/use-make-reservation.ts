import {
  make_reservation,
  ReservationType,
  SeatType,
  FinalReservationSubmissionInput,
  ReservationInfo,
  Warning,
} from "@/lib/api/services/reservation.service";
import { useState } from "react";
import { DateObject } from "react-multi-date-picker";
import { toast } from "sonner";

type MakeReservationResult =
  | {
      ok: true;
      reservation_info: ReservationInfo;
      warning: Warning;
    }
  | {
      ok: false;
    };

/**
 * Hook: useMakeReservation
 * 
 * Manages the state and logic for the first step of the reservation flow.
 * 
 * Flow:
 * 1. User selects date/time/type/seat
 * 2. `makeReservation` is called, which validates the inputs via the API.
 * 3. The API checks for conflicts (e.g. outside working hours, overlaps).
 * 4. If successful, returns the parsed `reservation_info` and any `warning` 
 *    (e.g., if there is a "System Only" overlap that the user should know about).
 * 
 * The second step (committing the reservation) is handled by `useFinalReservationSubmission`.
 */
export function useMakeReservation(options?: { initialDate?: string }) {
  const [reservationDate, setReservationDate] = useState(
    options?.initialDate || new DateObject().format("YYYY-MM-DD"),
  );

  const [reservationType, setReservationType] =
    useState<ReservationType | null>(null);

  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const [seatType, setSeatType] = useState<SeatType | null>(null);
  const [seatNumber, setSeatNumber] = useState<number | null>(null);

  const [pending, setPending] = useState(false);

  /**
   * Validates local state and builds the payload expected by the API.
   * Shows toast errors if any required fields are missing or invalid.
   */
  function buildReservationInput(): FinalReservationSubmissionInput | null {
    if (!reservationDate) {
      toast.error("لطفا تاریخ رزرو را انتخاب کنید");
      return null;
    }

    if (!reservationType) {
      toast.error("لطفا نوع رزرو را انتخاب کنید");
      return null;
    }

    if (!startTime) {
      toast.error("لطفا زمان شروع را انتخاب کنید");
      return null;
    }

    if (!endTime) {
      toast.error("لطفا زمان پایان را انتخاب کنید");
      return null;
    }

    if (endTime <= startTime) {
      toast.error("زمان پایان باید بعد از زمان شروع باشد");
      return null;
    }

    if (!seatType) {
      toast.error("لطفا نوع صندلی را انتخاب کنید");
      return null;
    }

    if (seatNumber == null) {
      toast.error("لطفا شماره صندلی را انتخاب کنید");
      return null;
    }

    return {
      reservation_date: reservationDate,
      reservation_type: reservationType,
      start_time: startTime,
      end_time: endTime,
      seat_type: seatType,
      seat_number: seatNumber,
    };
  }

  /**
   * Calls the `make_reservation` API endpoint (Step 1).
   * 
   * Returns an object indicating success/failure. If successful, includes
   * the sanitized reservation_info and any warnings to present to the user.
   */
  async function makeReservation(): Promise<MakeReservationResult> {
    const input = buildReservationInput();

    if (!input) {
      return { ok: false };
    }

    setPending(true);

    try {
      const { message, reservation_info, warning } =
        await make_reservation(input);

      toast.success(message || "اطلاعات رزرو تایید شد");

      return {
        ok: true,
        reservation_info,
        warning,
      };
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "خطا در بررسی اطلاعات رزرو";

      toast.error(message);

      return { ok: false };
    } finally {
      setPending(false);
    }
  }

  /** Resets form fields. Optionally provide a date to set, or defaults to initialDate / today. */
  function resetReservationForm(newDate?: string) {
    setReservationDate(
      newDate || options?.initialDate || new DateObject().format("YYYY-MM-DD"),
    );
    setReservationType(null);
    setStartTime("");
    setEndTime("");
    setSeatType(null);
    setSeatNumber(null);
  }

  return {
    reservationDate,
    reservationType,
    startTime,
    endTime,
    seatType,
    seatNumber,
    pending,

    setReservationDate,
    setReservationType,
    setStartTime,
    setEndTime,
    setSeatType,
    setSeatNumber,

    buildReservationInput,
    makeReservation,
    resetReservationForm,
  };
}
