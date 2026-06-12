"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import {
  DateSelectArg,
  DatesSetArg,
  EventClickArg,
  EventContentArg,
} from "@fullcalendar/core";
import faLocale from "@fullcalendar/core/locales/fa";

import DatePicker, { DateObject } from "react-multi-date-picker";
import TimePicker from "react-multi-date-picker/plugins/time_picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import gregorian from "react-date-object/calendars/gregorian";
import gregorian_en from "react-date-object/locales/gregorian_en";

import { useModal } from "@/hooks/useModal";
import { Modal } from "@/components/ui/modal";
import Select from "../../../components/form/Select";

import { CalendarEvent } from "@/app/type";
import { DesktopSeat } from "@/app/(admin)/page";
import { useAuth } from "@/context/AuthContext";
import { mapScheduleIntervalsToCalendarEvents } from "./mapScheduleIntervalsToCalendarEvents";
import {
  FinalReservationSubmissionInput,
  ReservationSystemOnly,
  ReservationType,
  SeatType,
  SYSTEM_ONLY_TYPES,
} from "@/lib/api/services/reservation.service";
import { useMakeReservation } from "../hooks/use-make-reservation";
import { FinalReservationModal } from "./seat-map/FinalReservationModal";
import { useFinalReservationSubmission } from "../hooks/use-final-reservation-submission";
import { toast } from "sonner";
import { useWeeklyScheduleIntervals } from "../hooks/use-weekly-schedule-intervals";
import { useQueryClient } from "@tanstack/react-query";
import { reservationKeys } from "../queryKeys";

type CalendarMode = "create" | "view";

type ReservationOption = {
  value: ReservationType;
  label: string;
};

// seat existence is handled conditionally in parent component but i keep the type safe for now.
type HomeCalendarProps = {
  seat?: DesktopSeat;
};

const PC_RESERVATION_OPTIONS: ReservationOption[] = [
  { value: "only running programs", label: "محاسبات" },
  { value: "dorsan desk", label: "درسان دسک" },
  { value: "internship", label: "کارآموزی" },
  { value: "project", label: "پروژه" },
];

const LAPTOP_RESERVATION_OPTIONS: ReservationOption[] = [
  { value: "internship", label: "کارآموزی" },
  { value: "project", label: "پروژه" },
];

const HomeCalendar = ({ seat }: HomeCalendarProps) => {
  const [verifiedReservationInput, setVerifiedReservationInput] =
    useState<FinalReservationSubmissionInput | null>(null);

  //state for system only reservations
  const [isSystemOverride, setIsSystemOverride] = useState(false);

  const calendarRef = useRef<FullCalendar>(null);

  /**
   * Used to prevent TimePicker from keeping an invalid selected value.
   */
  const previousValidEndRef = useRef<DateObject | null>(null);
  const previousValidStartRef = useRef<DateObject | null>(null);

  // make-reservation modal
  const {
    isOpen: isMakeReservationModalOpen,
    openModal: openMakeReservationModal,
    closeModal: closeMakeReservationModal,
  } = useModal();

  // final-reservation modal
  const {
    isOpen: isFinalReservationModalOpen,
    openModal: openFinalReservationModal,
    closeModal: closeFinalReservationModal,
  } = useModal();

  const [mode, setMode] = useState<CalendarMode>("create");
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null,
  );

  const [selectedWeekDate, setSelectedWeekDate] = useState<string>(
    new DateObject({
      calendar: gregorian,
      locale: gregorian_en,
    }).format("YYYY-MM-DD"),
  );

  const isReadOnly = mode === "view";

  const { user } = useAuth();
  const queryClient = useQueryClient();

  /**
   * Reservation API related
   */
  const {
    reservationDate,
    reservationType,
    startTime,
    endTime,

    setReservationDate,
    setReservationType,
    setStartTime,
    setEndTime,
    setSeatType,
    setSeatNumber,

    makeReservation,
    resetReservationForm,
  } = useMakeReservation();

  // final reservation submission api
  const { submitFinalReservation, pending: finalSubmissionPending } =
    useFinalReservationSubmission();

  /**
   * Keep selected seat data in reservation hook.
   * This avoids building API payload manually inside HomeCalendar.
   */
  useEffect(() => {
    if (!seat) return;

    setSeatType(seat.type as SeatType);
    setSeatNumber(seat.number);
  }, [seat, setSeatType, setSeatNumber]);

  // fetch intervals of the week
  const { intervals: scheduleIntervals, refetch: refetchScheduleIntervals } =
    useWeeklyScheduleIntervals({
      seatType: seat?.type,
      seatNumber: seat?.number,
      date: selectedWeekDate,
    });

  // make it usable for calendar
  const events = useMemo(
    () => mapScheduleIntervalsToCalendarEvents(scheduleIntervals),
    [scheduleIntervals],
  );

  // static options for reservation type select
  const reservationOptions = useMemo(() => {
    return seat?.type === "laptop"
      ? LAPTOP_RESERVATION_OPTIONS
      : PC_RESERVATION_OPTIONS;
  }, [seat?.type]);

  const selectedDateObject = useMemo(() => {
    if (!reservationDate) return null;

    return dateStringToPersianDateObject(reservationDate);
  }, [reservationDate]);

  const startTimeObject = useMemo(() => {
    if (!selectedDateObject || !startTime) return null;

    return mergeDateAndTimeString(selectedDateObject, startTime);
  }, [selectedDateObject, startTime]);

  const endTimeObject = useMemo(() => {
    if (!selectedDateObject || !endTime) return null;

    return mergeDateAndTimeString(selectedDateObject, endTime);
  }, [selectedDateObject, endTime]);

  // Helpers

  const resetModalFields = () => {
    setMode("create");
    setSelectedEvent(null);
    previousValidEndRef.current = null;
    resetReservationForm();
    setIsSystemOverride(false);

    /**
     * resetReservationForm may clear seat data, so set it again.
     */
    if (seat) {
      setSeatType(seat.type as SeatType);
      setSeatNumber(seat.number);
    }
  };

  const handleCloseModal = () => {
    closeMakeReservationModal();
    resetModalFields();
  };

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    // openFinalReservationModal();
    resetModalFields();

    const selected = toPersianDateObject(selectInfo.start);
    const start = toPersianDateObject(selectInfo.start);
    const end = toPersianDateObject(selectInfo.end);
    // console.log(start., ",,,,,", end);

    if (seat) {
      setSeatType(seat.type as SeatType);
      setSeatNumber(seat.number);
    }

    setMode("create");
    setSelectedEvent(null);

    setReservationDate(formatDateForApi(selected));
    setStartTime(formatTimeForApi(start));
    setEndTime(formatTimeForApi(end));

    previousValidEndRef.current = end;
    previousValidStartRef.current = start;

    openMakeReservationModal();
  };

  // edit api is not availabel yet.
  const handleEventClick = (clickInfo: EventClickArg) => {
    const event = clickInfo.event;
    const start = event.start ? toPersianDateObject(event.start) : null;
    const end = event.end ? toPersianDateObject(event.end) : null;
    const reservationType = clickInfo.event.extendedProps?.reservationType;
    const isSystemOnly = isSystemOnlyHelper(reservationType);
    const reservedByID = clickInfo.event.extendedProps?.reservedBy as
      | number
      | undefined;
    const isMine = user?.id != null && reservedByID === user?.id;

    if (isSystemOnly && !isMine) {
      resetModalFields();
      setMode("create");
      setSelectedEvent(null);
      setIsSystemOverride(true);
    } else {
      setMode("view");
      setSelectedEvent(event as unknown as CalendarEvent);
      setReservationType(
        (event.extendedProps?.reservationType as ReservationType) ?? null,
      );
    }

    if (start) {
      setReservationDate(formatDateForApi(start));
      setStartTime(formatTimeForApi(start));
      previousValidStartRef.current = start;
    }
    if (end) {
      setEndTime(formatTimeForApi(end));
      previousValidEndRef.current = end;
    }
    openMakeReservationModal();
  };

  // TODO: make these to time change handlres into one.

  const handleEndTimeChange = (time: DateObject | null) => {
    if (!time || !selectedDateObject) return;

    const fixedEndTime = mergeDateAndTime(selectedDateObject, time);

    if (!isWithinWorkingHours(fixedEndTime)) {
      alert("ساعت فقط بین ۸ تا ۱۴ قابل انتخاب است");

      if (previousValidEndRef.current) {
        setEndTime(formatTimeForApi(previousValidEndRef.current));
      }

      return;
    }

    if (startTimeObject && !isEndAfterStart(startTimeObject, fixedEndTime)) {
      alert("زمان پایان باید بعد از زمان شروع باشد");

      if (previousValidEndRef.current) {
        setEndTime(formatTimeForApi(previousValidEndRef.current));
      }

      return;
    }

    setEndTime(formatTimeForApi(fixedEndTime));
    previousValidEndRef.current = fixedEndTime;
  };

  const handleStartTimeChange = (time: DateObject | null) => {
    if (!time || !selectedDateObject) return;

    const fixedStartTime = mergeDateAndTime(selectedDateObject, time);

    if (!isWithinWorkingHours(fixedStartTime)) {
      alert("ساعت فقط بین ۸ تا ۱۴ قابل انتخاب است");

      if (previousValidStartRef.current) {
        setStartTime(formatTimeForApi(previousValidStartRef.current));
      }

      return;
    }

    if (endTimeObject && !isEndAfterStart(fixedStartTime, endTimeObject)) {
      alert("زمان پایان باید بعد از زمان شروع باشد");

      if (previousValidStartRef.current) {
        setStartTime(formatTimeForApi(previousValidStartRef.current));
      }

      return;
    }

    setStartTime(formatTimeForApi(fixedStartTime));
    previousValidStartRef.current = fixedStartTime;
  };

  const handleAddReservation = async () => {
    if (!seat) {
      alert("صندلی انتخاب نشده است");
      return;
    }

    if (!reservationType || !reservationDate || !startTime || !endTime) {
      toast.error("همه فیلدها الزامی است");
      return;
    }

    if (!startTimeObject || !endTimeObject) {
      toast.error("زمان انتخابی معتبر نیست");
      return;
    }

    if (!isEndAfterStart(startTimeObject, endTimeObject)) {
      toast.error("زمان پایان باید بعد از زمان شروع باشد");
      return;
    }

    if (
      !isWithinWorkingHours(startTimeObject) ||
      !isWithinWorkingHours(endTimeObject)
    ) {
      toast.error("ساعت کاری فقط بین ۸ تا ۱۴ است");
      return;
    }

    setSeatType(seat.type as SeatType);
    setSeatNumber(seat.number);

    const result = await makeReservation();

    if (!result.ok) return;

    setVerifiedReservationInput(result.input);
    closeMakeReservationModal();
    openFinalReservationModal();
    resetModalFields();
  };

  const handleDatesSet = (dateInfo: DatesSetArg) => {
    const startOfWeek = new DateObject({
      date: dateInfo.view.activeStart,
      calendar: gregorian,
      locale: gregorian_en,
    }).format("YYYY-MM-DD");

    if (startOfWeek !== selectedWeekDate) {
      setSelectedWeekDate(startOfWeek);
    }
  };

  async function handleConfirmFinalSubmission() {
    if (!verifiedReservationInput) return;

    const res = await submitFinalReservation(verifiedReservationInput);

    if (!res) return;

    closeFinalReservationModal();
    setVerifiedReservationInput(null);
    refetchScheduleIntervals();
    await queryClient.invalidateQueries({
      queryKey: reservationKeys.active(),
    });
    resetReservationForm();

    // onDeselect?.();
  }

  const selectAllow = (selectInfo: { start: Date; end: Date }) => {
    const overlappingEvents =
      calendarRef.current
        ?.getApi()
        .getEvents()
        .filter((event) => {
          const eventStart = event.start!;
          const eventEnd = event.end!;
          return eventStart < selectInfo.end && eventEnd > selectInfo.start;
        }) || [];

    // If no overlap -> always allow
    if (overlappingEvents.length === 0) return true;

    // If every overlapping event is system‑only -> allow
    const allSystemOnly = overlappingEvents.every((event) => {
      const type = event.extendedProps?.reservationType as ReservationType;
      return type === "dorsan desk" || type === "only running programs";
    });

    return allSystemOnly;
  };

  return (
    <div
      className="w-full  rounded-2xl border border-gray-200
         dark:border-gray-800 dark:bg-white/[0.03] "
    >
      <div className="custom-calendar">
        <FullCalendar
          // calendar custom UI
          eventBackgroundColor="transparent"
          eventBorderColor="transparent"
          eventTextColor="inherit"
          // some configuration
          eventOverlap={false}
          selectOverlap={false}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          locale={faLocale}
          editable
          selectable
          direction="rtl"
          firstDay={6}
          hiddenDays={[4, 5]}
          initialView="timeGridWeek"
          allDaySlot={false}
          slotMinTime="08:00:00"
          slotMaxTime="14:00:00"
          slotDuration="00:15:00"
          slotLabelInterval="00:15:00"
          snapDuration="00:15:00"
          headerToolbar={{
            left: "myPrev,myNext today",
            center: "title",
            right: "timeGridWeek,timeGridDay",
          }}
          customButtons={{
            myNext: {
              text: "◀", // یا ""
              hint: "بعدی",
              click: () => calendarRef.current?.getApi().next(),
            },
            myPrev: {
              text: "▶", // یا ""
              hint: "قبلی",
              click: () => calendarRef.current?.getApi().prev(),
            },
          }}
          initialDate={getInitialPersianWeekDate()}
          // ref & handlres
          selectAllow={selectAllow}
          eventContent={renderEventContent(user?.id)}
          ref={calendarRef}
          events={events}
          select={handleDateSelect}
          eventClick={handleEventClick}
          datesSet={(date) => handleDatesSet(date)}
        />
      </div>
      <ReservationModalContent
        isOpen={isMakeReservationModalOpen}
        mode={mode}
        selectedEvent={selectedEvent}
        selectedDate={selectedDateObject}
        startTime={startTimeObject}
        endTime={endTimeObject}
        reservationType={reservationType}
        reservationOptions={reservationOptions}
        isReadOnly={isReadOnly}
        isSystemOverride={isSystemOverride}
        onClose={handleCloseModal}
        onReservationTypeChange={setReservationType}
        onEndTimeChange={handleEndTimeChange}
        onStartTimeChange={handleStartTimeChange}
        onSubmit={handleAddReservation}
      />

      <FinalReservationModal
        isOpen={isFinalReservationModalOpen}
        onClose={() => {
          closeFinalReservationModal();
          setVerifiedReservationInput(null);
        }}
        onConfirm={handleConfirmFinalSubmission}
        pending={finalSubmissionPending}
        data={verifiedReservationInput}
      />
    </div>
  );
};

// Modal
type ReservationModalContentProps = {
  isOpen: boolean;
  mode: CalendarMode;
  selectedEvent: CalendarEvent | null;
  selectedDate: DateObject | null;
  startTime: DateObject | null;
  endTime: DateObject | null;
  reservationType: ReservationType | null;
  reservationOptions: ReservationOption[];
  isReadOnly: boolean;
  isSystemOverride: boolean;
  onClose: () => void;
  onReservationTypeChange: (value: ReservationType | null) => void;
  onEndTimeChange: (value: DateObject | null) => void;
  onStartTimeChange: (value: DateObject | null) => void;
  onSubmit: () => void | Promise<void>;
};

const ReservationModalContent = ({
  isOpen,
  mode,
  selectedEvent,
  selectedDate,
  startTime,
  endTime,
  reservationType,
  reservationOptions,
  isReadOnly,
  isSystemOverride,
  onClose,
  onReservationTypeChange,
  onEndTimeChange,
  onStartTimeChange,
  onSubmit,
}: ReservationModalContentProps) => {
  const title = mode === "view" ? "جزئیات رزرو" : "رزرو جدید";
  const submitLabel = selectedEvent ? "ویرایش رزرو" : "ثبت رزرو";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-[700px] overflow-visible p-6 lg:p-10"
    >
      <div className="relative flex flex-col overflow-visible px-2">
        <div>
          <h5 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            {title}
          </h5>
        </div>

        {isSystemOverride && (
          <div className="fa my-2 rounded-lg border border-yellow-300 bg-yellow-50 p-3 text-sm text-yellow-800">
            ⚠️ این بازه زمانی رزرو سیستمی دارد (درسان دسک / محاسبات). صندلی
            فیزیکی آزاد است، اما سیستم در دسترس نیست. می‌توانید صندلی را فقط
            برای استفاده از سخت‌افزار رزرو کنید.
          </div>
        )}

        <div className="mt-8">
          <div className="flex justify-between gap-15">
            <div className="w-full">
              <label className="fa mb-1.5 block font-medium text-gray-700 dark:text-gray-400">
                تاریخ انتخابی
              </label>

              <div className="h-11 w-full rounded-lg border border-gray-200 bg-res-green-100 px-4 py-2.5 text-sm text-gray-700">
                {selectedDate?.format("YYYY/MM/DD") ?? "-"}
              </div>
            </div>

            <div className="w-full">
              <label className="fa mb-1.5 block font-medium text-gray-700 dark:text-gray-400">
                تایپ رزرویشن
              </label>

              <Select
                key={`${mode}-${reservationType ?? "empty"}`}
                options={reservationOptions}
                placeholder="انتخاب کنید"
                onChange={(value) =>
                  onReservationTypeChange(value as ReservationType)
                }
                defaultValue={reservationType || ""}
                className="fa dark:bg-dark-900"
                disabled={isReadOnly}
              />
            </div>
          </div>

          <div className="mt-6 flex flex-row-reverse justify-end gap-10">
            <div className="w-full">
              <label className="fa mb-1.5 block text-sm font-medium text-gray-700">
                زمان شروع
              </label>

              <DatePicker
                editable={false}
                disabled={isReadOnly}
                value={startTime}
                disableDayPicker
                format="HH:mm"
                calendar={persian}
                locale={persian_fa}
                containerStyle={{ width: "100%" }}
                inputClass="h-11 w-full rounded-lg border border-gray-300 px-4 text-sm disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500"
                plugins={[
                  <TimePicker
                    key="start-time"
                    hideSeconds
                    mStep={15}
                    disabled={isReadOnly}
                  />,
                ]}
                onChange={onStartTimeChange}
              />
              {/* <div className="h-11 w-full rounded-lg border border-gray-200 bg-res-green-100 px-4 py-2.5 text-sm text-gray-700">
                {startTime?.format("HH:mm") ?? "-"}
              </div> */}
            </div>

            <div className="w-full">
              <label className="fa mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                زمان پایان
              </label>

              <DatePicker
                editable={false}
                disabled={isReadOnly}
                value={endTime}
                disableDayPicker
                format="HH:mm"
                calendar={persian}
                locale={persian_fa}
                containerStyle={{ width: "100%" }}
                inputClass=" h-11 w-full rounded-lg border border-gray-300 px-4 text-sm disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500"
                plugins={[
                  <TimePicker
                    key="end-time"
                    hideSeconds
                    mStep={15}
                    disabled={isReadOnly}
                  />,
                ]}
                onChange={onEndTimeChange}
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3 sm:justify-end">
          <button
            onClick={onClose}
            type="button"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium"
          >
            بستن
          </button>

          {!isReadOnly && (
            <button
              onClick={onSubmit}
              type="button"
              className="bg-res-green-success hover:bg-res-green-success/90 rounded-lg px-4 py-2.5 text-sm font-medium text-white"
            >
              {submitLabel}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};

// custom event content

type EventType = ReservationType | "event";

const renderEventContent = (userId?: number) =>
  function EventContent(eventInfo: EventContentArg) {
    const reservedByID = eventInfo.event.extendedProps?.reservedBy as
      | number
      | undefined;

    const baseColorByType: Record<EventType, string> = {
      project: "bg-res-orange",
      internship: "bg-res-orange",
      "dorsan desk": "bg-res-gray-dark/30 ",
      "only running programs": "bg-res-gray-dark/30 ",
      event: "bg-res-red",
    };

    const type = (eventInfo.event.extendedProps?.reservationType ??
      "event") as EventType;

    const isMine =
      type !== "event" && userId != null && reservedByID === userId;

    const reservationColor = isMine
      ? "bg-res-green-success"
      : baseColorByType[type];

    return (
      <div
        className={`flex h-full w-full flex-col  rounded-sm ${reservationColor} p-1 text-white  `}
      >
        <p className="text-xs font-semibold ">
          {eventInfo.event.extendedProps.seat}
        </p>
        <div className="text-xs font-semibold">{eventInfo.timeText}</div>
        <div className="truncate text-xs">{eventInfo.event.title}</div>
      </div>
    );
  };

// helpers

const WORKING_START_MINUTES = 8 * 60;
const WORKING_END_MINUTES = 14 * 60;

// Type-safe helper function
const isSystemOnlyHelper = (
  reservationType: EventType,
): reservationType is ReservationSystemOnly => {
  return SYSTEM_ONLY_TYPES.includes(reservationType as ReservationSystemOnly);
};

const toPersianDateObject = (date: Date) => {
  return new DateObject({
    date,
    calendar: persian,
    locale: persian_fa,
  });
};

const dateStringToPersianDateObject = (date: string) => {
  return new DateObject({
    date,
    calendar: gregorian,
    locale: gregorian_en,
  }).convert(persian, persian_fa);
};

const mergeDateAndTime = (date: DateObject, time: DateObject) => {
  return new DateObject(date).set({
    hour: time.hour,
    minute: time.minute,
    second: 0,
    millisecond: 0,
  });
};

const mergeDateAndTimeString = (date: DateObject, time: string) => {
  const [hour, minute] = time.split(":").map(Number);

  return new DateObject(date).set({
    hour,
    minute,
    second: 0,
    millisecond: 0,
  });
};

const getTimeInMinutes = (time: DateObject) => {
  return time.hour * 60 + time.minute;
};

const isWithinWorkingHours = (time: DateObject) => {
  const minutes = getTimeInMinutes(time);

  return minutes >= WORKING_START_MINUTES && minutes <= WORKING_END_MINUTES;
};

const isEndAfterStart = (startTime: DateObject, endTime: DateObject) => {
  return getTimeInMinutes(endTime) > getTimeInMinutes(startTime);
};

const formatDateForApi = (date: DateObject) => {
  return new DateObject(date)
    .convert(gregorian, gregorian_en)
    .format("YYYY-MM-DD");
};

const formatTimeForApi = (time: DateObject) => {
  // make it english number
  const hour = String(time.hour).padStart(2, "0");
  const minute = String(time.minute).padStart(2, "0");

  return `${hour}:${minute}`;
};

// if day passed wednesday, show next week
function getInitialPersianWeekDate(): Date {
  const today = new Date();
  const dow = today.getDay(); // 0 (Sun) - 6 (Sat)

  if (dow >= 4) {
    const nextWeekSaturday = new Date(today);
    const daysUntilSaturday = (6 - dow + 7) % 7 || 7;
    nextWeekSaturday.setDate(today.getDate() + daysUntilSaturday);
    return nextWeekSaturday;
  }

  return today;
}
export default HomeCalendar;
