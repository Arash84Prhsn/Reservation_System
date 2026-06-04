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
import useWeeklyScheduleIntervals from "../hooks/use-weekly-schedule-intervals";
import { mapScheduleIntervalsToCalendarEvents } from "./mapScheduleIntervalsToCalendarEvents";
import {
  ReservationType,
  SeatType,
} from "@/lib/api/services/reservation.service";
import { useMakeReservation } from "../hooks/use-make-reservation";

type CalendarMode = "create" | "view";

type ReservationOption = {
  value: ReservationType;
  label: string;
};

type HomeCalendarProps = {
  seat?: DesktopSeat;
};

const PC_RESERVATION_OPTIONS: ReservationOption[] = [
  { value: "only running programs" as ReservationType, label: "محاسبات" },
  { value: "dorsan desk" as ReservationType, label: "درسان دسک" },
  { value: "internship" as ReservationType, label: "کارآموزی" },
  { value: "project" as ReservationType, label: "پروژه" },
];

const LAPTOP_RESERVATION_OPTIONS: ReservationOption[] = [
  { value: "internship" as ReservationType, label: "کارآموزی" },
  { value: "project" as ReservationType, label: "پروژه" },
];

const HomeCalendar = ({ seat }: HomeCalendarProps) => {
  const calendarRef = useRef<FullCalendar>(null);

  /**
   * Used to prevent TimePicker from keeping an invalid selected value.
   */
  const previousValidEndRef = useRef<DateObject | null>(null);

  const { isOpen, openModal, closeModal } = useModal();

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

  /**
   * Keep selected seat data in reservation hook.
   * This avoids building API payload manually inside HomeCalendar.
   */
  useEffect(() => {
    if (!seat) return;

    setSeatType(seat.type as SeatType);
    setSeatNumber(seat.number);
  }, [seat, setSeatType, setSeatNumber]);

  /**
   * Fetch intervals of selected week.
   */
  const { scheduleIntervals } = useWeeklyScheduleIntervals({
    seatType: seat?.type,
    seatNumber: seat?.number,
    date: selectedWeekDate,
  });

  /**
   * Convert API schedule intervals to FullCalendar events.
   */
  const events = useMemo(
    () => mapScheduleIntervalsToCalendarEvents(scheduleIntervals),
    [scheduleIntervals],
  );

  /**
   * Reservation type options depend on selected seat type.
   */
  const reservationOptions = useMemo(() => {
    return seat?.type === "laptop"
      ? LAPTOP_RESERVATION_OPTIONS
      : PC_RESERVATION_OPTIONS;
  }, [seat?.type]);

  /**
   * UI DateObject values derived from hook string state.
   * Hook remains the single source of truth.
   */
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

  const resetModalFields = () => {
    setMode("create");
    setSelectedEvent(null);
    previousValidEndRef.current = null;
    resetReservationForm();

    /**
     * resetReservationForm may clear seat data, so set it again.
     */
    if (seat) {
      setSeatType(seat.type as SeatType);
      setSeatNumber(seat.number);
    }
  };

  const handleCloseModal = () => {
    closeModal();
    resetModalFields();
  };

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    resetModalFields();

    const selected = toPersianDateObject(selectInfo.start);
    const start = toPersianDateObject(selectInfo.start);
    const end = toPersianDateObject(selectInfo.end);

    if (!isWithinWorkingHours(start) || !isWithinWorkingHours(end)) {
      alert("ساعت کاری فقط بین ۸ تا ۱۴ است");
      return;
    }

    if (!isEndAfterStart(start, end)) {
      alert("زمان پایان باید بعد از زمان شروع باشد");
      return;
    }

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

    openModal();
  };

  /**
   * Edit/View API is not available yet.
   * So we intentionally do not open reservation details for now.
   */
  const handleEventClick = (_clickInfo: EventClickArg) => {
    // const event = clickInfo.event;
    // const start = event.start ? toPersianDateObject(event.start) : null;
    // const end = event.end ? toPersianDateObject(event.end) : null;
    //
    // setMode("view");
    // setSelectedEvent(event as unknown as CalendarEvent);
    //
    // setReservationType(
    //   (event.extendedProps?.reservationType as ReservationType) ?? null,
    // );
    //
    // if (start) {
    //   setReservationDate(formatDateForApi(start));
    //   setStartTime(formatTimeForApi(start));
    // }
    //
    // if (end) {
    //   setEndTime(formatTimeForApi(end));
    //   previousValidEndRef.current = end;
    // }
    //
    // openModal();
  };

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

  const handleAddReservation = async () => {
    if (!seat) {
      alert("صندلی انتخاب نشده است");
      return;
    }

    if (!reservationType || !reservationDate || !startTime || !endTime) {
      alert("همه فیلدها الزامی است");
      return;
    }

    if (!startTimeObject || !endTimeObject) {
      alert("زمان انتخابی معتبر نیست");
      return;
    }

    if (!isEndAfterStart(startTimeObject, endTimeObject)) {
      alert("زمان پایان باید بعد از زمان شروع باشد");
      return;
    }

    if (
      !isWithinWorkingHours(startTimeObject) ||
      !isWithinWorkingHours(endTimeObject)
    ) {
      alert("ساعت کاری فقط بین ۸ تا ۱۴ است");
      return;
    }

    setSeatType(seat.type as SeatType);
    setSeatNumber(seat.number);

    const result = await makeReservation();

    if (!result.ok) return;

    closeModal();
    resetModalFields();

    /**
     * TODO:
     * If useWeeklyScheduleIntervals exposes refetch, call it here.
     * Example:
     * await refetch();
     */
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

  return (
    <div className="w-full rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="custom-calendar">
        <FullCalendar
          /**
           * Calendar custom UI
           */
          eventBackgroundColor="transparent"
          eventBorderColor="transparent"
          eventTextColor="inherit"
          /**
           * Calendar configuration
           */
          eventOverlap={false}
          selectOverlap={false}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          locale={faLocale}
          editable={false}
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
              text: "◀",
              hint: "بعدی",
              click: () => calendarRef.current?.getApi().next(),
            },
            myPrev: {
              text: "▶",
              hint: "قبلی",
              click: () => calendarRef.current?.getApi().prev(),
            },
          }}
          /**
           * Ref & handlers
           */
          eventContent={renderEventContent(user?.id)}
          ref={calendarRef}
          events={events}
          select={handleDateSelect}
          eventClick={handleEventClick}
          datesSet={handleDatesSet}
        />
      </div>

      <ReservationModalContent
        isOpen={isOpen}
        mode={mode}
        selectedEvent={selectedEvent}
        selectedDate={selectedDateObject}
        startTime={startTimeObject}
        endTime={endTimeObject}
        reservationType={reservationType}
        reservationOptions={reservationOptions}
        isReadOnly={isReadOnly}
        pending={pending}
        onClose={handleCloseModal}
        onReservationTypeChange={setReservationType}
        onEndTimeChange={handleEndTimeChange}
        onSubmit={handleAddReservation}
      />
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Modal                                                                       */
/* -------------------------------------------------------------------------- */

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
  pending: boolean;
  onClose: () => void;
  onReservationTypeChange: (value: ReservationType | null) => void;
  onEndTimeChange: (value: DateObject | null) => void;
  onSubmit: () => void;
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
  pending,
  onClose,
  onReservationTypeChange,
  onEndTimeChange,
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

        <div className="mt-8">
          <div className="flex justify-between gap-15">
            <div className="w-full">
              <label className="fa mb-1.5 block font-medium text-gray-700 dark:text-gray-400">
                تاریخ انتخابی
              </label>

              <div className="h-11 w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-600">
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

              <div className="h-11 w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-600">
                {startTime?.format("HH:mm") ?? "-"}
              </div>
            </div>

            <div className="w-full">
              <label className="fa mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                زمان پایان
              </label>

              <DatePicker
                editable={false}
                disabled={isReadOnly || pending}
                value={endTime}
                disableDayPicker
                format="HH:mm"
                calendar={persian}
                locale={persian_fa}
                containerStyle={{ width: "100%" }}
                inputClass="fa h-11 w-full rounded-lg border border-gray-300 px-4 text-sm disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500"
                plugins={[
                  <TimePicker
                    key="end-time"
                    hideSeconds
                    mStep={15}
                    disabled={isReadOnly || pending}
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
            disabled={pending}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60"
          >
            بستن
          </button>

          {!isReadOnly && (
            <button
              onClick={onSubmit}
              type="button"
              disabled={pending}
              className="bg-brand-500 hover:bg-brand-600 rounded-lg px-4 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending ? "در حال ثبت..." : submitLabel}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};

/* -------------------------------------------------------------------------- */
/* Custom event content                                                        */
/* -------------------------------------------------------------------------- */

type EventType = "reservation" | "event";

const renderEventContent = (userId?: number) =>
  function EventContent(eventInfo: EventContentArg) {
    const reservedByID = eventInfo.event.extendedProps?.reservedBy as
      | number
      | undefined;

    const type = (eventInfo.event.extendedProps?.type ?? "event") as EventType;

    const isMine =
      type === "reservation" && userId != null && reservedByID === userId;

    const baseColorByType: Record<EventType, string> = {
      reservation: "bg-purple-400",
      event: "bg-gray-400",
    };

    const reservationColor = isMine ? "bg-blue-400" : baseColorByType[type];

    return (
      <div
        className={`flex h-full w-full flex-col rounded-sm ${reservationColor} p-1 text-white`}
      >
        <div className="text-xs font-semibold">
          {eventInfo.event.extendedProps.seat}
        </div>
        <div className="text-xs font-semibold">{eventInfo.timeText}</div>
        <div className="truncate text-xs">{eventInfo.event.title}</div>
      </div>
    );
  };

/* -------------------------------------------------------------------------- */
/* Helper functions                                                            */
/* -------------------------------------------------------------------------- */

const WORKING_START_MINUTES = 8 * 60;
const WORKING_END_MINUTES = 14 * 60;

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
  return new DateObject(date).convert(gregorian, gregorian_en).format("YYYY-MM-DD");
};

const formatTimeForApi = (time: DateObject) => {
  return time.format("HH:mm");
};

export default HomeCalendar;