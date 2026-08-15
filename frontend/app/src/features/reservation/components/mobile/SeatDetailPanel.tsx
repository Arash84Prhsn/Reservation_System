import React, { useEffect, useMemo, useState } from "react";
import { type SeatStatus, MobileSeat } from "@/features/reservation/config/SeatMap.config";
import DatePicker, { DateObject } from "react-multi-date-picker";
import Select from "@/components/form/Select";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { TimeSlot, TimeSlotGrid } from "./TimeSlotGrid";
import {
  FinalReservationSubmissionInput,
  ReservationType,
  SeatType,
  Warning,
} from "@/lib/api/services/reservation.service";
import { useMakeReservation } from "@/features/reservation/hooks/use-make-reservation";
import { useWeeklyScheduleTimeslots } from "@/features/reservation/hooks/use-weekly-schedule-timeslots";

import { useFinalReservationSubmission } from "@/features/reservation/hooks/use-final-reservation-submission";
import { useModal } from "@/hooks/useModal";
import useOpenDatesForUser from "@/features/reservation/hooks/use-open-dates-for-user";
import { FinalReservationModal } from "@/features/reservation/components/shared/FinalReservationModal";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { reservationKeys } from "@/features/reservation/queryKeys";
import {
  PC_RESERVATION_OPTIONS,
  LAPTOP_RESERVATION_OPTIONS,
  getSeatTypeLabel,
} from "@/features/reservation/config/reservation-options";
import { toPersianDigits } from "@/lib/utils";
import { formatPersianTime } from "@/features/reservation/utils/date";

type SeatDetailPanelProps = {
  seat: MobileSeat;
  status: SeatStatus;
  initialDate?: string;
  onDateChange?: (date: string) => void;
  onDeselect: () => void;
};

/**
 * SeatDetailPanel - Mobile Reservation UI
 * 
 * This component is the primary interface for mobile users to book a seat.
 * It slides up from the bottom when a seat is tapped on the SeatMap.
 * 
 * Responsibilities:
 * - Displays seat information (Type, Number)
 * - Allows the user to select a date, time range, and reservation type
 * - Validates the selection and submits it to the API (Two-step flow)
 * - Displays a grid of available/booked timeslots for the selected date
 */
export function SeatDetailPanel({
  seat,
  initialDate,
  onDateChange,
  onDeselect,
}: SeatDetailPanelProps) {
  const [verifiedReservationInfo, setVerifiedReservationInfo] =
    useState<FinalReservationSubmissionInput | null>(null);

  // ADD THIS LINE ↓
  const [verifiedReservationWarning, setVerifiedReservationWarning] =
    useState<Warning | null>(null);

  const [hasSystemOnlyInRange, setHasSystemOnlyInRange] = useState(false); // 👈 new

  const queryClient = useQueryClient(); // ← ADD THIS

  const { isOpen, openModal, closeModal } = useModal();
  // make reservation
  const {
    reservationDate,
    reservationType,
    startTime,
    endTime,
    pending,

    setReservationDate,
    setReservationType,
    setStartTime,
    setEndTime,
    setSeatType,
    setSeatNumber,

    makeReservation,
    resetReservationForm,
  } = useMakeReservation({ initialDate });

  useEffect(() => {
    if (initialDate && initialDate !== reservationDate) {
      setReservationDate(initialDate);
    }
  }, [initialDate, reservationDate, setReservationDate]);

  // final reservation submission
  const { submitFinalReservation, pending: finalSubmissionPending } =
    useFinalReservationSubmission();

  // open dates for user
  const { openDates } = useOpenDatesForUser(seat.type as SeatType);

  // Determine which reservation type options to show based on seat type
  const reservationOptions = seat.type === "laptop"
    ? LAPTOP_RESERVATION_OPTIONS
    : PC_RESERVATION_OPTIONS;

  // full label for seat (e.g. "صندلی داتین ۱")
  const fullLabel = `${getSeatTypeLabel(seat.type as SeatType)} ${toPersianDigits(seat.number)}`;

  const finalSubmissionInput =
    useMemo<FinalReservationSubmissionInput | null>(() => {
      if (
        !reservationDate ||
        !reservationType ||
        !startTime ||
        !endTime ||
        !seat.type ||
        !seat.number
      ) {
        return null;
      }

      return {
        reservation_date: reservationDate,
        reservation_type: reservationType,
        start_time: startTime,
        end_time: endTime,
        seat_type: seat.type as SeatType,
        seat_number: seat.number,
      };
    }, [
      reservationDate,
      reservationType,
      startTime,
      endTime,
      seat.type,
      seat.number,
    ]);

  useEffect(() => {
    setSeatType(seat.type as SeatType);
    setSeatNumber(seat.number);
  }, [seat.type, seat.number, setSeatType, setSeatNumber]);

  function handleDateChange(value: DateObject | DateObject[] | null) {
    if (!value) return;

    if (Array.isArray(value)) return;

    const jsDate = value.toDate();

    const year = jsDate.getFullYear();
    const month = String(jsDate.getMonth() + 1).padStart(2, "0");
    const day = String(jsDate.getDate()).padStart(2, "0");

    const gregorianDate = `${year}-${month}-${day}`;

    setReservationDate(gregorianDate);
    onDateChange?.(gregorianDate);
  }

  async function handleOpenFinalModal() {
    await handleSubmitReservation();
    if (!finalSubmissionInput) {
      toast.error("DEV ERR: Reservation form is incomplete");
      return;
    }

    openModal();
  }

  /**
   * Triggers the first step of the two-step reservation process:
   * 1. Validates the input via make_reservation API
   * 2. If valid, opens the FinalReservationModal with the summary and any warnings
   */
  async function handleSubmitReservation() {
    setSeatType(seat.type as SeatType);
    setSeatNumber(seat.number);

    const result = await makeReservation();

    if (!result.ok) return; // Errors are handled inside the hook via toast

    setVerifiedReservationInfo(result.reservation_info);
    setVerifiedReservationWarning(result.warning);
    openModal();
  }

  /**
   * Final step of the reservation process:
   * Commits the reservation after the user confirms the warnings in the modal.
   */
  async function handleConfirmFinalSubmission() {
    if (!verifiedReservationInfo) return;

    const res = await submitFinalReservation(verifiedReservationInfo);

    if (!res) return;

    closeModal();
    setVerifiedReservationInfo(null);
    setVerifiedReservationWarning(null);

    // Refresh active reservations and current schedule view
    await queryClient.invalidateQueries({
      queryKey: reservationKeys.all,
    });

    // Hold the day and seat selection, only reset time slot selection
    setStartTime("");
    setEndTime("");
    setReservationType(null);
  }

  const handleCloseSeatDetailPanel = () => {
    resetReservationForm(reservationDate);
    onDeselect?.();
  };

  return (
    <>
      <div className="mt-4 rounded-4xl bg-res-green-100 border border-black p-4 text-white shadow-lg">
        <div className="mb-4 text-sm leading-6 text-gray-700 text-center">
          صندلی انتخاب شده: <strong> {fullLabel}</strong>
        </div>

        <div className="mt-4">
          {hasSystemOnlyInRange && (
            <div className="fa my-2 rounded-lg border border-yellow-300 bg-yellow-50 p-3 text-sm text-yellow-800">
              ⚠️ این بازه زمانی رزرو سیستمی دارد (درسان دسک / محاسبات). صندلی
              فیزیکی آزاد است، اما سیستم در دسترس نیست. می‌توانید صندلی را فقط
              برای استفاده از سخت‌افزار رزرو کنید.
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4 ">
          <div className="flex gap-2">
            <div className="w-full">
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                تاریخ رزرو
              </label>

              <DatePicker
                minDate={openDates && openDates[0] ? new DateObject(openDates[0]) : undefined}
                maxDate={openDates && openDates.length > 0 ? new DateObject(openDates[openDates.length - 1]) : undefined}
                editable={false}
                calendar={persian}
                locale={persian_fa}
                containerStyle={{ width: "100%" }}
                inputClass="fa h-11 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm text-black"
                className="text-black"
                containerClassName="w-full"
                onChange={handleDateChange}
                value={reservationDate ? new DateObject(reservationDate) : null}
              />
            </div>

            <div className="w-full">
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                نوع رزرو
              </label>

              <Select
                options={reservationOptions}
                placeholder="انتخاب کنید"
                className="relative text-black"
                // defaultValue={reservationType}
                onChange={(value) =>
                  setReservationType(value as ReservationType | null)
                }
              />
            </div>
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">
                انتخاب زمان
              </label>
              {startTime && endTime && (
                <span className="rounded border border-gray-300 bg-white px-2 py-0.5 text-xs font-medium text-res-green-success">
                  بازه انتخابی: {formatPersianTime(startTime)} تا {formatPersianTime(endTime)}
                </span>
              )}
              {startTime && !endTime && (
                <span className="rounded border border-gray-300 bg-white px-2 py-0.5 text-xs text-gray-600">
                  شروع: {formatPersianTime(startTime)} (روی زمان پایان کلیک کنید)
                </span>
              )}
            </div>

            <TimeSlotGridContainer
              date={reservationDate}
              endTime={endTime}
              startTime={startTime}
              seatNumber={seat.number}
              seatType={seat.type as SeatType}
              setStartTime={setStartTime}
              setEndTime={setEndTime}
              onRangeSelect={() => {

              }}
              onSystemOnlyWarning={setHasSystemOnlyInRange}
            />
          </div>

          <div className="flex gap-3 pt-2 sm:flex-row">
            <button
              onClick={handleOpenFinalModal}
              type="button"
              disabled={pending}
              className="w-full rounded-lg bg-res-green-success px-4 py-3 text-sm font-medium transition hover:bg-res-green-success/80 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending ? "در حال ثبت..." : "ثبت رزرو"}
            </button>
            <button
              onClick={handleCloseSeatDetailPanel}
              type="button"
              className=" w-[30%] rounded-lg bg-gray-600 px-4 py-3 text-sm font-medium transition hover:bg-gray-500"
            >
              بستن
            </button>
          </div>
        </div>
      </div>
      <FinalReservationModal
        isOpen={isOpen}
        onClose={() => {
          closeModal();
          setVerifiedReservationInfo(null);
        }}
        onConfirm={handleConfirmFinalSubmission}
        pending={finalSubmissionPending}
        reservationInfo={verifiedReservationInfo}
        reservationWarning={verifiedReservationWarning}
      />
    </>
  );
}

// time slot container
function TimeSlotGridContainer({
  date,
  seatType,
  seatNumber,
  startTime,
  endTime,
  setStartTime,
  setEndTime,
  onRangeSelect,
  onSystemOnlyWarning,
}: {
  date: string;
  seatType: SeatType;
  seatNumber: number;

  startTime: string;
  endTime: string;
  setStartTime: (t: string) => void;
  setEndTime: (t: string) => void;
  onRangeSelect?: (start: string, end: string) => void;
  onSystemOnlyWarning?: (hasSystemOnly: boolean) => void;
}) {
  const { schedule, loading, error } = useWeeklyScheduleTimeslots(
    {
      date,
      seatType,
      seatNumber,
    },
    {
      enabled: Boolean(date && seatType && seatNumber),
    },
  );

  const slots = useMemo<TimeSlot[]>(() => {
    const selectedDay = schedule.find((day) => day.date === date);

    if (!selectedDay) return [];

    return selectedDay.slots.map((slot) => ({
      id: `${selectedDay.date}-${slot.timeslot_number}`,
      time: slot.start_time,
      startTime: slot.start_time,
      endTime: slot.end_time,
      status: slot.status,
      systemOnly:
        slot.reservation_type === "dorsan desk" ||
        slot.reservation_type === "only running programs",
    }));
  }, [schedule, date]);

  // Compute system‑only presence inside the selected range
  useEffect(() => {
    if (!startTime || !endTime || !schedule.length) return;

    const selectedDay = schedule.find((day) => day.date === date);
    if (!selectedDay) return;

    const startIdx = selectedDay.slots.findIndex(
      (s) => s.start_time === startTime,
    );
    const endIdx = selectedDay.slots.findIndex(
      (s) => s.end_time === endTime || s.start_time === endTime,
    );
    if (startIdx === -1 || endIdx === -1) return;

    const rangeSlots = selectedDay.slots.slice(startIdx, endIdx + 1);
    const hasSystemOnly = rangeSlots.some(
      (slot) =>
        slot.reservation_type === "dorsan desk" ||
        slot.reservation_type === "only running programs",
    );
    onSystemOnlyWarning?.(hasSystemOnly);
  }, [startTime, endTime, date, schedule, onSystemOnlyWarning]);

  if (!date) {
    return (
      <div className="text-sm text-gray-400">
        ابتدا تاریخ رزرو را انتخاب کنید.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-sm text-gray-300">در حال دریافت زمان‌ها...</div>
    );
  }

  if (error) {
    return <div className="text-sm text-red-400">{error}</div>;
  }

  if (slots.length === 0) {
    return (
      <div className="text-sm text-gray-400">
        برای این تاریخ اسلاتی پیدا نشد.
      </div>
    );
  }

  return (
    <TimeSlotGrid
      slots={slots}
      startTime={startTime}
      endTime={endTime}
      setStartTime={setStartTime}
      setEndTime={setEndTime}
      onRangeSelect={onRangeSelect}
    />
  );
}
