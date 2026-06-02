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
  FinalReservationSubmissionInput,
  ReservationType,
  ScheduleDay,
  ScheduleSlotStatus,
  SeatType,
} from "@/lib/api/services/reservation.service";
import { useMakeReservation } from "../../hooks/use-make-reservation";
import { useWeeklyScheduleTimeslots } from "../../hooks/use-weekly-shedule-timeslots";
import UseOpenDatesForUser from "../../hooks/use-oepn-dates-for-user";

import { Modal } from "@/components/ui/modal";
import { useFinalReservationSubmission } from "../../hooks/use-final-reservation-submission";
import { useModal } from "@/hooks/useModal";
import useOpenDatesForUser from "../../hooks/use-oepn-dates-for-user";

type SeatDetailPanelProps = {
  seat: Seat;
  status: SeatStatus;
  onDeselect: () => void;
};

export function SeatDetailPanel({ seat }: SeatDetailPanelProps) {
  const [verifiedReservationInput, setVerifiedReservationInput] =
    useState<FinalReservationSubmissionInput | null>(null);
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
  const { openDates, loading: openDatesLoading } = useOpenDatesForUser(
    seat.type as SeatType,
  );

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
    setVerifiedReservationInput(result.input);
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
    const res = await handleSubmitReservation();
    if (!finalSubmissionInput) {
      // You can replace this with toast.error if you prefer.
      console.warn("Reservation form is incomplete.");
      return;
    }

    openModal();
  }

  async function handleConfirmFinalSubmission() {
    if (!verifiedReservationInput) return;

    const res = await submitFinalReservation(verifiedReservationInput);

    if (!res) return;

    closeModal();
    setVerifiedReservationInput(null);

    resetReservationForm();
    // onDeselect?.();
  }

  function handleClosePanel() {
    resetReservationForm();
    // onDeselect?.();
  }

  return (
    <>
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
              onClick={handleOpenFinalModal}
              type="button"
              disabled={pending}
              className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending ? "در حال ثبت..." : "ثبت رزرو"}
            </button>
          </div>
        </div>
      </div>
      <FinalReservationModal
        isOpen={isOpen}
        onClose={() => {
          closeModal();
          setVerifiedReservationInput(null);
        }}
        onConfirm={handleConfirmFinalSubmission}
        pending={finalSubmissionPending}
        data={verifiedReservationInput}
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

// FinalReservationModal
type FinalReservationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  pending?: boolean;
  data: FinalReservationSubmissionInput | null;
};

function getReservationTypeLabel(type: string | null | undefined) {
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

function getSeatTypeLabel(type: string | null | undefined) {
  switch (type) {
    case "pc":
      return "کامپیوتر";
    case "laptop":
      return "لپ‌تاپ";
    default:
      return type || "نامشخص";
  }
}

// Modal
export function FinalReservationModal({
  isOpen,
  onClose,
  onConfirm,
  pending = false,
  data,
}: FinalReservationModalProps) {
  if (!data) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-[560px] overflow-visible p-6 lg:p-8"
    >
      <div className="fa relative flex flex-col overflow-visible px-1 text-right">
        <div>
          <h5 className="mb-2 text-xl font-semibold text-gray-800 dark:text-white/90">
            تایید نهایی رزرو
          </h5>

          <p className="text-sm leading-6 text-gray-500 dark:text-gray-400">
            لطفاً اطلاعات رزرو را بررسی کنید. پس از تایید، رزرو شما ثبت نهایی
            خواهد شد.
          </p>
        </div>

        <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-white/[0.03]">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InfoItem label="تاریخ رزرو" value={data.reservation_date} />

            <InfoItem
              label="نوع رزرو"
              value={getReservationTypeLabel(data.reservation_type)}
            />

            <InfoItem label="زمان شروع" value={data.start_time} />

            <InfoItem label="زمان پایان" value={data.end_time} />

            <InfoItem
              label="نوع صندلی"
              value={getSeatTypeLabel(data.seat_type)}
            />

            <InfoItem label="شماره صندلی" value={String(data.seat_number)} />
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.05]"
          >
            انصراف
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={pending}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? "در حال ثبت..." : "تایید و ثبت رزرو"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">
        {label}
      </div>

      <div className="min-h-11 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90">
        {value || "—"}
      </div>
    </div>
  );
}
