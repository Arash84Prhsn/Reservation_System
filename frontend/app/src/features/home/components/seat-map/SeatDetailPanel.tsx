import React, { useEffect, useMemo, useState } from "react";
import { type SeatStatus, MobileSeat } from "./SeatMap.config";
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
import { useMakeReservation } from "../../hooks/use-make-reservation";
import { useWeeklyScheduleTimeslots } from "../../hooks/use-weekly-shedule-timeslots";

import { useFinalReservationSubmission } from "../../hooks/use-final-reservation-submission";
import { useModal } from "@/hooks/useModal";
import useOpenDatesForUser from "../../hooks/use-oepn-dates-for-user";
import { FinalReservationModal } from "./FinalReservationModal";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { reservationKeys } from "../../queryKeys";

type SeatDetailPanelProps = {
  seat: MobileSeat;
  status: SeatStatus;
  onDeselect: () => void;
};

export function SeatDetailPanel({ seat, onDeselect }: SeatDetailPanelProps) {
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
  } = useMakeReservation();

  // final reservation submission
  const { submitFinalReservation, pending: finalSubmissionPending } =
    useFinalReservationSubmission();

  // open dates for user
  const { openDates } = useOpenDatesForUser(seat.type as SeatType);

  // static options for reservation type select
  const pcReservationOptions: { value: ReservationType; label: string }[] = [
    { value: "only running programs", label: "محاسبات" },
    { value: "dorsan desk", label: "درسان دسک" },
    { value: "internship", label: "کارآموزی" },
    { value: "project", label: "پروژه" },
  ];

  const laptopReservationOptions: { value: ReservationType; label: string }[] =
    [
      { value: "internship", label: "کارآموزی" },
      { value: "project", label: "پروژه" },
    ];

  // full label for seat (e.g. "dotin1")
  const fullLabel = `${seat.type}${seat.number}`;

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

  // Handlres
  async function handleSubmitReservation() {
    const result = await makeReservation();

    if (!result.ok) return;
    setVerifiedReservationInfo(result.reservation_info);
    setVerifiedReservationWarning(result.warning);
    openModal();
  }

  function handleDateChange(value: DateObject | DateObject[] | null) {
    if (!value) return;

    if (Array.isArray(value)) return;

    const jsDate = value.toDate();

    const year = jsDate.getFullYear();
    const month = String(jsDate.getMonth() + 1).padStart(2, "0");
    const day = String(jsDate.getDate()).padStart(2, "0");

    const gregorianDate = `${year}-${month}-${day}`;

    setReservationDate(gregorianDate);
  }

  async function handleOpenFinalModal() {
    await handleSubmitReservation();
    if (!finalSubmissionInput) {
      // You can replace this with toast.error if you prefer.
      // console.warn("Reservation form is incomplete.");
      toast.error("DEV ERR: Reservation form is incomplete");
      return;
    }

    openModal();
  }

  async function handleConfirmFinalSubmission() {
    if (!verifiedReservationInfo) return;

    const res = await submitFinalReservation(verifiedReservationInfo);
    if (!res) return;

    closeModal();
    setVerifiedReservationInfo(null);
    setVerifiedReservationWarning(null); // ADD THIS

    // ADD THIS QUERY INVALIDATION ↓
    await queryClient.invalidateQueries({
      queryKey: reservationKeys.active(),
    });

    resetReservationForm();
    // onDeselect?.();
  }

  const handleCloseSeatDetailPanel = () => {
    resetReservationForm();
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
                minDate={new DateObject(openDates[0])}
                maxDate={new DateObject(openDates[openDates.length - 1])}
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
                options={
                  seat.type === "laptop"
                    ? laptopReservationOptions
                    : pcReservationOptions
                }
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
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              انتخاب زمان
            </label>

            <TimeSlotGridContainer
              date={reservationDate}
              endTime={endTime}
              startTime={startTime}
              seatNumber={seat.number}
              seatType={seat.type as SeatType}
              setStartTime={setStartTime}
              setEndTime={setEndTime}
              onRangeSelect={(start, end) => {
                console.log(`انتخاب بازه: ${start} تا ${end}`);
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
function TimeSlotGridContainer(props: {
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
      date: props.date,
      seatType: props.seatType,
      seatNumber: props.seatNumber,
    },
    {
      enabled: Boolean(props.date && props.seatType && props.seatNumber),
    },
  );

  const slots = useMemo<TimeSlot[]>(() => {
    const selectedDay = schedule.find((day) => day.date === props.date);

    if (!selectedDay) return [];

    return selectedDay.slots.map((slot) => ({
      id: `${selectedDay.date}-${slot.timeslot_number}`,
      time: slot.start_time,
      status: slot.status,
      systemOnly:
        slot.reservation_type === "dorsan desk" ||
        slot.reservation_type === "only running programs",
    }));
  }, [schedule, props.date]);

  console.log("slots: ", slots);

  // Compute system‑only presence inside the selected range
  useEffect(() => {
    if (!props.startTime || !props.endTime || !schedule.length) return;

    const selectedDay = schedule.find((day) => day.date === props.date);
    if (!selectedDay) return;

    const startIdx = selectedDay.slots.findIndex(
      (s) => s.start_time === props.startTime,
    );
    const endIdx = selectedDay.slots.findIndex(
      (s) => s.start_time === props.endTime,
    );
    if (startIdx === -1 || endIdx === -1) return;

    const rangeSlots = selectedDay.slots.slice(startIdx, endIdx + 1);
    const hasSystemOnly = rangeSlots.some(
      (slot) =>
        slot.reservation_type === "dorsan desk" ||
        slot.reservation_type === "only running programs",
    );
    props.onSystemOnlyWarning?.(hasSystemOnly);
  }, [
    props.startTime,
    props.endTime,
    props.date,
    schedule,
    props.onSystemOnlyWarning,
    props,
  ]);

  if (!props.date) {
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
      startTime={props.startTime}
      endTime={props.endTime}
      setStartTime={props.setStartTime}
      setEndTime={props.setEndTime}
      onRangeSelect={props.onRangeSelect}
    />
  );
}
