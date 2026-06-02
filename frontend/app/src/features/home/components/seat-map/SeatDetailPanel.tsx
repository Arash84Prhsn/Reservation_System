// ─── SeatDetailPanel ─────────────────────────────────────
// previous seat detail is end of this file

//TODO: read these 4 opened pages.

import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
  // useRef,
  useState,
} from "react";
import { type SeatStatus, Seat } from "./SeatMap.config";
import { CalendarEvent, ChairState } from "@/app/type";
import DatePicker, { DateObject } from "react-multi-date-picker";
import Select from "@/components/form/Select";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { SlotStatus, TimeSlot, TimeSlotGrid } from "./TimeSlotGrid";
import {
  ReservationType,
  ScheduleDay,
  ScheduleSlotStatus,
  SeatType,
} from "@/lib/api/services/reservation.service";
import { useMakeReservation } from "../../hooks/use-make-reservation";
import { useWeeklyScheduleTimeslots } from "../../hooks/use-weekly-shedule-timeslots";
import UseOpenDatesForUser from "../../hooks/use-oepn-dates-for-user";

type SeatDetailPanelProps = {
  seat: Seat;
  status: SeatStatus;
  onDeselect: () => void;
};

export function SeatDetailPanel({ seat }: SeatDetailPanelProps) {
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

  const { openDates, loading, error } = UseOpenDatesForUser(
    seat.type as SeatType,
  );

  console.log("opendates : ", openDates);

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

  useEffect(() => {
    setSeatType(seat.type as SeatType);
    setSeatNumber(seat.number);
  }, [seat.type, seat.number, setSeatType, setSeatNumber]);

  async function handleSubmitReservation() {
    const result = await makeReservation();

    if (!result) return;

    resetReservationForm();
  }

  const fullLabel = `${seat.type}${seat.number}`;

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

  return (
    <div className="mt-4 rounded-xl bg-gray-800 p-4 text-white shadow-lg">
      <div className="mb-4 text-sm leading-6">
        صندلی <strong>{fullLabel}</strong>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex gap-2">
          <div className="w-full">
            <label className="mb-1.5 block text-sm font-medium text-gray-300">
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
            <label className="mb-1.5 block text-sm font-medium text-gray-300">
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
          <label className="mb-1.5 block text-sm font-medium text-gray-300">
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
          />
        </div>

        <div className="flex flex-col gap-3 pt-2 sm:flex-row">
          <button
            onClick={resetReservationForm}
            type="button"
            className="w-full rounded-lg bg-gray-600 px-4 py-3 text-sm font-medium transition hover:bg-gray-500"
          >
            بستن
          </button>

          <button
            onClick={handleSubmitReservation}
            type="button"
            disabled={pending}
            className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? "در حال ثبت..." : "ثبت رزرو"}
          </button>
        </div>
      </div>
    </div>
  );
}

function TimeSlotGridContainer(props: {
  date: string;
  seatType: SeatType;
  seatNumber: number;

  startTime: string;
  endTime: string;
  setStartTime: (t: string) => void;
  setEndTime: (t: string) => void;
  onRangeSelect?: (start: string, end: string) => void;
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
    }));
  }, [schedule, props.date]);

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
