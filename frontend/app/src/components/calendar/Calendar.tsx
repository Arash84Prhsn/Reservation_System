"use client";

import React, { useState, useRef, Dispatch, SetStateAction } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import {
  // EventInput,
  DateSelectArg,
  EventClickArg,
  EventContentArg,
} from "@fullcalendar/core";

import { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import faLocale from "@fullcalendar/core/locales/fa";

import DatePicker from "react-multi-date-picker";
import TimePicker from "react-multi-date-picker/plugins/time_picker";

import { useModal } from "@/hooks/useModal";
import { Modal } from "@/components/ui/modal";

import { CalendarEvent } from "@/app/type";
import Select from "../form/Select";
import { DesktopSeat } from "@/app/(admin)/page";
import { useAuth } from "@/context/AuthContext";
// import SelectInputs from "../form/form-elements/SelectInputs";

type CalendarProps = {
  seat?: DesktopSeat;
  events?: CalendarEvent[];
  onAddEvent?: Dispatch<SetStateAction<CalendarEvent[]>>;
};

const Calendar = ({ seat, events, onAddEvent }: CalendarProps) => {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null,
  );

  const [eventTitle, setEventTitle] = useState("");

  const [selectedDate, setSelectedDate] = useState<DateObject | null>(null);
  const [startTime, setStartTime] = useState<DateObject | null>(null); // read-only
  const [endTime, setEndTime] = useState<DateObject | null>(null); // editable

  const [eventLevel, setEventLevel] = useState("Primary");

  const calendarRef = useRef<FullCalendar>(null);

  const { isOpen, openModal, closeModal } = useModal();
  const { user } = useAuth();

  // to prevent time picker to change date when it is NOT valid.
  const previousValidStartRef = useRef<DateObject | null>(null);
  const previousValidEndRef = useRef<DateObject | null>(null);

  const options = [
    { value: "A", label: "A" },
    { value: "B", label: "B" },
    { value: "C", label: "C" },
  ];

  // =========================
  // Helpers
  // =========================

  // const roundTo15Minutes = (date: Date) => {
  //   const ms = 1000 * 60 * 15;

  //   return new Date(Math.round(date.getTime() / ms) * ms);
  // };

  const mergeDateAndTime = (date: DateObject, time: DateObject): Date => {
    const merged = new Date(date.toDate()); // تبدیل به Date واقعی

    merged.setHours(time.hour, time.minute, 0, 0);

    return merged;
  };

  // TODO: make these 2 helper to one
  const validateWorkingHours = (date: Date) => {
    const hour = date.getHours();
    return hour >= 8 && hour < 14;
  };

  const isValidWorkingTime = (date: DateObject) => {
    const js = date.toDate();
    const hour = js.getHours();

    return hour >= 8 && hour < 14;
  };

  const resetModalFields = () => {
    setEventTitle("");
    // setStartTime(null);
    setEndTime(null);
    setEventLevel("Primary");
    setSelectedEvent(null);
  };

  // =========================
  // Calendar handlers
  // =========================

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    resetModalFields();

    const date = new DateObject(selectInfo.start);

    date.set({ calendar: persian, locale: persian_fa });

    setSelectedDate(date);

    setStartTime(
      new DateObject(selectInfo.start).set({
        calendar: persian,
        locale: persian_fa,
      }),
    );
    setEndTime(new DateObject(selectInfo.end));

    openModal();
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    const event = clickInfo.event;

    setSelectedEvent(event as unknown as CalendarEvent);

    setEventTitle(event.title);

    const start = event.start ? new DateObject(event.start) : null;
    const end = event.end ? new DateObject(event.end) : null;

    // تبدیل Date معمولی به DateObject
    if (start) {
      setSelectedDate(new DateObject(start));
      setStartTime(new DateObject(start));
    }

    if (end) setEndTime(new DateObject(end));
    previousValidStartRef.current = start;
    previousValidEndRef.current = end;

    setEventLevel(event.extendedProps.calendar || "Primary");

    openModal();
  };

  const handleAddOrUpdateEvent = () => {
    if (!eventTitle || !selectedDate || !startTime || !endTime) {
      alert("همه فیلدها الزامی است");
      return;
    }

    const start = mergeDateAndTime(selectedDate, startTime);
    const end = mergeDateAndTime(selectedDate, endTime);
    console.log("start:", start);
    console.log("end:", end);

    if (end.getTime() <= start.getTime()) {
      alert("زمان پایان باید بعد از زمان شروع باشد");
      return;
    }

    if (!validateWorkingHours(start) || !validateWorkingHours(end)) {
      alert("ساعت کاری فقط بین ۸ تا ۱۴ است");
      return;
    }

    const newEventData = {
      title: eventTitle,
      start: start.toISOString(),
      end: end.toISOString(),
      extendedProps: {
        calendar: eventLevel,
        seat: seat,
      },
    };

    if (!onAddEvent) return;
    if (selectedEvent) {
      onAddEvent((prev) =>
        prev.map((ev) =>
          ev.id === selectedEvent.id ? { ...ev, ...newEventData } : ev,
        ),
      );
    } else {
      onAddEvent((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          ...newEventData,
          allDay: false,
        },
      ]);
    }

    closeModal();
    resetModalFields();
  };

  return (
    <div className="w-full rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="custom-calendar">
        <FullCalendar
          eventBackgroundColor="transparent"
          eventBorderColor="transparent"
          eventTextColor="inherit"
          eventContent={renderEventContent(user?.id)}
          eventOverlap={false}
          selectOverlap={false}
          ref={calendarRef}
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
          events={events}
          select={handleDateSelect}
          eventClick={handleEventClick}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "timeGridWeek,timeGridDay",
          }}
        />
      </div>

      <Modal
        isOpen={isOpen}
        onClose={() => {
          closeModal();
          resetModalFields();
        }}
        className="max-w-[700px] overflow-visible p-6 lg:p-10"
      >
        <div className="relative flex flex-col overflow-visible px-2">
          <div>
            <h5 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              {selectedEvent ? "تغییر رزرو" : "رزرو جدید"}
            </h5>
          </div>

          <div className="mt-8">
            {/* title */}
            <div className="flex justify-between gap-15">
              <div className="w-full">
                <label className="fa mb-1.5 block font-medium text-gray-700 dark:text-gray-400">
                  تاریخ انتخابی
                </label>
                <div className="h-11 w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-600">
                  {selectedDate?.format("YYYY/MM/DD")}
                </div>
              </div>
              <div className="w-full">
                <label className="fa mb-1.5 block font-medium text-gray-700 dark:text-gray-400">
                  تایپ رزرویشن
                </label>
                <Select
                  options={options}
                  placeholder="انتخاب کنید"
                  onChange={(value) => setEventTitle(value)}
                  // onChange={(e) => setEventTitle(e)}
                  className="fa dark:bg-dark-900"
                />
              </div>
            </div>

            {/* dates */}
            <div className="mt-6 flex flex-row-reverse justify-end gap-10">
              {/* start */}
              <div className="w-full">
                <div>
                  <label className="fa mb-1.5 block text-sm font-medium text-gray-700">
                    زمان شروع
                  </label>

                  <div className="h-11 w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-600">
                    {startTime?.format("HH:mm")}
                  </div>
                </div>
              </div>

              {/* end */}
              <div className="w-full">
                <label className="fa mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  زمان پایان
                </label>

                <DatePicker
                  editable={false}
                  value={
                    endTime
                      ? new DateObject().set({
                          hour: endTime.hour,
                          minute: endTime.minute,
                        })
                      : null
                  }
                  disableDayPicker
                  format="HH:mm"
                  calendar={persian}
                  locale={persian_fa}
                  containerStyle={{ width: "100%" }}
                  inputClass="fa h-11 w-full rounded-lg border border-gray-300 px-4 text-sm"
                  plugins={[
                    <TimePicker key="end-time" hideSeconds mStep={15} />,
                  ]}
                  onChange={(time) => {
                    if (!time) return;

                    if (!isValidWorkingTime(time)) {
                      alert("ساعت فقط بین ۸ تا ۱۴ قابل انتخاب است");

                      // برگرداندن به مقدار معتبر قبلی (اگر وجود داشت)
                      if (previousValidEndRef.current) {
                        setEndTime(new DateObject(previousValidEndRef.current));
                      }
                    } else {
                      // ذخیره مقدار جدید به عنوان معتبر
                      previousValidEndRef.current = new DateObject(time);
                      setEndTime(time);
                    }
                  }}
                />
              </div>
            </div>
          </div>

          {/* footer */}
          <div className="mt-6 flex items-center gap-3 sm:justify-end">
            <button
              onClick={() => {
                closeModal();
                resetModalFields();
              }}
              type="button"
              className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium"
            >
              بستن
            </button>

            <button
              onClick={handleAddOrUpdateEvent}
              type="button"
              className="bg-brand-500 hover:bg-brand-600 rounded-lg px-4 py-2.5 text-sm font-medium text-white"
            >
              {selectedEvent ? "ویرایش رزرو" : "ثبت رزرو"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

type EventType = "reservation" | "event";

const renderEventContent =
  (userId?: number) => (eventInfo: EventContentArg) => {
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

export default Calendar;
