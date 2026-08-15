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

import { useModal } from "@/shared/hooks/useModal";
import { Modal } from "@/shared/components/ui/modal";
import Select from "@/shared/components/form/Select";

import { CalendarEvent, DesktopSeat } from "@/features/reservation/types";
import { useAuth } from "@/shared/context/AuthContext";
import { mapScheduleIntervalsToCalendarEvents } from "@/features/reservation/utils/mapScheduleIntervalsToCalendarEvents";
import {
  FinalReservationSubmissionInput,
  ReservationSystemOnly,
  ReservationType,
  SeatType,
  SYSTEM_ONLY_TYPES,
  Warning,
} from "@/shared/lib/api/services/reservation.service";
import { useMakeReservation } from "@/features/reservation/hooks/use-make-reservation";
import { FinalReservationModal } from "@/features/reservation/components/shared/FinalReservationModal";
import { ConfirmModal } from "@/shared/components/ui/modal/ConfirmModal";
import { useFinalReservationSubmission } from "@/features/reservation/hooks/use-final-reservation-submission";
import { toast } from "sonner";
import { useWeeklyScheduleIntervals } from "@/features/reservation/hooks/use-weekly-schedule-intervals";
import { useQueryClient } from "@tanstack/react-query";
import { reservationKeys } from "@/features/reservation/queryKeys";
import { useCancelReservationById } from "@/features/reservation/hooks/use-cancel-reservation-by-id";
import { cn } from "@/shared/lib/utils";
import {
  ReservationOption,
  PC_RESERVATION_OPTIONS,
  LAPTOP_RESERVATION_OPTIONS,
} from "@/features/reservation/config/reservation-options";
import {
  toPersianDateObject,
  dateStringToPersianDateObject,
  mergeDateAndTime,
  mergeDateAndTimeString,
  isWithinWorkingHours,
  isEndAfterStart,
  formatDateForApi,
  formatTimeForApi,
  getInitialPersianWeekDate,
  formatPersianNumber,
} from "@/features/reservation/utils/date";

// ============================================================
// CALENDAR MODE & TYPES
// ============================================================

type CalendarMode = "create" | "view";

/**
 * HomeCalendar — Desktop Reservation Calendar
 *
 * This is the main desktop view for making reservations. It shows a
 * FullCalendar week view (Saturday–Wednesday, 8AM–2PM) with existing
 * reservations and allows users to:
 *
 * 1. Select an empty time range → opens "Make Reservation" modal
 * 2. Click an existing event → opens "View/Cancel Reservation" modal
 * 3. Navigate between weeks
 *
 * The reservation flow is two-step:
 *   Step 1: `make_reservation` — validates the request & returns warnings
 *   Step 2: `final_reservation_submission` — commits the reservation
 *
 * Props:
 *   seat — The currently selected seat from SeatList (required for API calls)
 */

type HomeCalendarProps = {
  seat?: DesktopSeat;
};

const HomeCalendar = ({ seat }: HomeCalendarProps) => {
  // ─── Verified reservation state (from Step 1 API response) ──
  const [verifiedReservationInfo, setVerifiedReservationInfo] =
    useState<FinalReservationSubmissionInput | null>(null);
  const [verifiedReservationWanring, setVerifiedReservationWanring] =
    useState<Warning | null>(null);

  // Tracks whether user is selecting over system-only events
  const [isSystemOverride, setIsSystemOverride] = useState(false);

  const calendarRef = useRef<FullCalendar>(null);

  // ─── Modal state ────────────────────────────────────────────
  const {
    isOpen: isMakeReservationModalOpen,
    openModal: openMakeReservationModal,
    closeModal: closeMakeReservationModal,
  } = useModal();

  const {
    isOpen: isFinalReservationModalOpen,
    openModal: openFinalReservationModal,
    closeModal: closeFinalReservationModal,
  } = useModal();

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  const [mode, setMode] = useState<CalendarMode>("create");
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null,
  );

  // Tracks which week the user is viewing (Gregorian YYYY-MM-DD of week start)
  const [selectedWeekDate, setSelectedWeekDate] = useState<string>(
    new DateObject({
      calendar: gregorian,
      locale: gregorian_en,
    }).format("YYYY-MM-DD"),
  );

  const isReadOnly = mode === "view";

  const { user } = useAuth();
  const queryClient = useQueryClient();

  // ─── Reservation form & API hooks ───────────────────────────
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

  const { submitFinalReservation, pending: finalSubmissionPending } =
    useFinalReservationSubmission();

  /**
   * Sync the selected seat into the reservation form hook.
   * This avoids manually building the API payload inside HomeCalendar.
   */
  useEffect(() => {
    if (!seat) return;
    setSeatType(seat.type as SeatType);
    setSeatNumber(seat.number);
  }, [seat, setSeatType, setSeatNumber]);

  // ─── Fetch schedule data for the current week ───────────────
  const { intervals: scheduleIntervals, refetch: refetchScheduleIntervals } =
    useWeeklyScheduleIntervals({
      seatType: seat?.type,
      seatNumber: seat?.number,
      date: selectedWeekDate,
    });

  // Transform API intervals into FullCalendar-compatible events
  const events = useMemo(
    () => mapScheduleIntervalsToCalendarEvents(scheduleIntervals),
    [scheduleIntervals],
  );

  const { cancelReservation, pending: cancelPending } =
    useCancelReservationById();

  // Determine which reservation type options to show based on seat type
  const reservationOptions = useMemo(() => {
    return seat?.type === "laptop"
      ? LAPTOP_RESERVATION_OPTIONS
      : PC_RESERVATION_OPTIONS;
  }, [seat?.type]);

  // ─── Derived DateObject values for time pickers ─────────────
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

  // ─── Internal Helpers ───────────────────────────────────────

  const resetModalFields = () => {
    setMode("create");
    setSelectedEvent(null);
    resetReservationForm();
    setIsSystemOverride(false);

    // resetReservationForm clears seat data, so restore it
    if (seat) {
      setSeatType(seat.type as SeatType);
      setSeatNumber(seat.number);
    }
  };

  const handleCloseModal = () => {
    closeMakeReservationModal();
    resetModalFields();
  };

  // ─── Calendar Event Handlers ────────────────────────────────

  /**
   * Called when the user selects an empty time range on the calendar.
   * Opens the "Make Reservation" modal pre-filled with the selected time.
   */
  const handleDateSelect = (selectInfo: DateSelectArg) => {
    resetModalFields();

    const selected = toPersianDateObject(selectInfo.start);
    const start = toPersianDateObject(selectInfo.start);
    const end = toPersianDateObject(selectInfo.end);

    if (seat) {
      setSeatType(seat.type as SeatType);
      setSeatNumber(seat.number);
    }

    setMode("create");
    setSelectedEvent(null);

    setReservationDate(formatDateForApi(selected));
    setStartTime(formatTimeForApi(start));
    setEndTime(formatTimeForApi(end));

    openMakeReservationModal();
  };

  /**
   * Called when the user clicks an existing event on the calendar.
   *
   * Two scenarios:
   * 1. System-only event (not mine) → opens in "create" mode with system-override warning
   * 2. Any other event → opens in "view" mode with event details
   */
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
      // System-only event by someone else → allow creating on top of it
      resetModalFields();
      setMode("create");
      setSelectedEvent(null);
      setIsSystemOverride(true);
    } else {
      // Regular event → show details
      setMode("view");
      setSelectedEvent(event as unknown as CalendarEvent);
      setReservationType(
        (event.extendedProps?.reservationType as ReservationType) ?? null,
      );
    }

    if (start) {
      setReservationDate(formatDateForApi(start));
      setStartTime(formatTimeForApi(start));
    }
    if (end) {
      setEndTime(formatTimeForApi(end));
    }
    openMakeReservationModal();
  };

  /**
   * Validates time changes from the end-time picker.
   * Ensures the new end time is within working hours and after start time.
   */
  const handleEndTimeChange = (time: DateObject | null) => {
    if (!time || !selectedDateObject) return;

    const fixedEndTime = mergeDateAndTime(selectedDateObject, time);

    if (!isWithinWorkingHours(fixedEndTime)) {
      toast.warning("ساعت فقط بین ۸ تا ۱۴ قابل انتخاب است");
      return;
    }

    if (startTimeObject && !isEndAfterStart(startTimeObject, fixedEndTime)) {
      toast.warning("زمان پایان باید بعد از زمان شروع باشد");
      return;
    }

    setEndTime(formatTimeForApi(fixedEndTime));
  };

  /**
   * Validates time changes from the start-time picker.
   * Ensures the new start time is within working hours and before end time.
   */
  const handleStartTimeChange = (time: DateObject | null) => {
    if (!time || !selectedDateObject) return;

    const fixedStartTime = mergeDateAndTime(selectedDateObject, time);

    if (!isWithinWorkingHours(fixedStartTime)) {
      toast.warning("ساعت فقط بین ۸ تا ۱۴ قابل انتخاب است");
      return;
    }

    if (endTimeObject && !isEndAfterStart(fixedStartTime, endTimeObject)) {
      toast.warning("زمان پایان باید بعد از زمان شروع باشد");
      return;
    }

    setStartTime(formatTimeForApi(fixedStartTime));
  };

  /**
   * Handles the "Submit Reservation" button in the modal.
   * This triggers Step 1 of the two-step flow:
   *   1. Validates the reservation via `make_reservation` API
   *   2. If valid, opens the FinalReservationModal for confirmation
   */
  const handleAddReservation = async () => {
    if (!seat) {
      toast.warning("صندلی انتخاب نشده است");
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
      toast.warning("زمان پایان باید بعد از زمان شروع باشد");
      return;
    }

    if (
      !isWithinWorkingHours(startTimeObject) ||
      !isWithinWorkingHours(endTimeObject)
    ) {
      toast.warning("ساعت کاری فقط بین ۸ تا ۱۴ است");
      return;
    }

    setSeatType(seat.type as SeatType);
    setSeatNumber(seat.number);

    const result = await makeReservation();

    if (!result.ok) return;

    setVerifiedReservationInfo(result.reservation_info);
    setVerifiedReservationWanring(result.warning);
    closeMakeReservationModal();
    openFinalReservationModal();
    resetModalFields();
  };

  /**
   * Called when the user navigates to a different week.
   * Triggers a refetch of schedule data for the new week.
   */
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

  /**
   * Step 2 of the two-step reservation flow.
   * Called when the user confirms in the FinalReservationModal.
   * Commits the reservation and refreshes all related data.
   */
  async function handleConfirmFinalSubmission() {
    if (!verifiedReservationInfo) return;

    const res = await submitFinalReservation(verifiedReservationInfo);

    if (!res) return;

    closeFinalReservationModal();
    setVerifiedReservationInfo(null);
    refetchScheduleIntervals();
    await queryClient.invalidateQueries({
      queryKey: reservationKeys.active(),
    });
    resetReservationForm();
  }

  /**
   * Controls which time ranges can be selected on the calendar.
   * Allows selection over system-only events (since the physical seat is free)
   * but prevents selection over regular reservations and lab meetings.
   */
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

    if (overlappingEvents.length === 0) return true;

    const allSystemOnly = overlappingEvents.every((event) => {
      const type = event.extendedProps?.reservationType as ReservationType;
      return type === "dorsan desk" || type === "only running programs";
    });

    return allSystemOnly;
  };

  /** Handles cancellation of a reservation from the view modal. */
  const handleCancelReservation = async () => {
    setIsCancelModalOpen(true);
  };

  const confirmCancel = async () => {
    const reservationId = selectedEvent?.extendedProps?.reservationId;

    try {
      if (reservationId) await cancelReservation(reservationId);
      closeMakeReservationModal();
    } catch {
      toast.error("حذف رزرو انجام نشد");
    } finally {
      setIsCancelModalOpen(false);
    }
  };

  // ─── Render ─────────────────────────────────────────────────

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
            today: {
              text: "هفته جاری",
              click: () => calendarRef.current?.getApi().today(),
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
        isCanceling={cancelPending}
        onCancel={handleCancelReservation}
      />

      <FinalReservationModal
        isOpen={isFinalReservationModalOpen}
        onClose={() => {
          closeFinalReservationModal();
          setVerifiedReservationInfo(null);
        }}
        onConfirm={handleConfirmFinalSubmission}
        pending={finalSubmissionPending}
        reservationInfo={verifiedReservationInfo}
        reservationWarning={verifiedReservationWanring}
      />

      <ConfirmModal
        isOpen={isCancelModalOpen}
        title="حذف رزرو"
        message="آیا از حذف این رزرو مطمئن هستید؟ این عملیات غیرقابل بازگشت است."
        confirmText="حذف رزرو"
        cancelText="انصراف"
        isDestructive={true}
        isLoading={cancelPending}
        onConfirm={confirmCancel}
        onCancel={() => setIsCancelModalOpen(false)}
      />
    </div>
  );
};

// ============================================================
// RESERVATION MODAL
// ============================================================

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
  onCancel?: () => void | Promise<void>;
  isCanceling?: boolean;
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
  onCancel,
  isCanceling,
}: ReservationModalContentProps) => {
  const title = mode === "view" ? "جزئیات رزرو" : "رزرو جدید";
  const submitLabel = selectedEvent ? "ویرایش رزرو" : "ثبت رزرو";

  const { user } = useAuth();

  const reservedByID = selectedEvent?.extendedProps?.reservedBy as
    | number
    | undefined;
  const isMine = user?.id != null && reservedByID === user?.id;

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
                {selectedDate ? formatPersianNumber(selectedDate.format("YYYY/MM/DD")) : "-"}
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

          {mode === "view" && onCancel && isMine && (
            <button
              onClick={onCancel}
              type="button"
              disabled={isCanceling}
              className="rounded-lg bg-red-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-600 disabled:opacity-60"
            >
              {isCanceling ? "در حال حذف..." : "حذف رزرو"}
            </button>
          )}

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

// ============================================================
// CUSTOM EVENT CONTENT RENDERER
// ============================================================

/**
 * Custom event renderer for FullCalendar.
 * Color-codes events based on:
 *   - Green: my reservations
 *   - Orange: others' reservations
 *   - Gray: system-only reservations (dorsan desk / running programs)
 *   - Red: lab meeting events
 */

type EventType = ReservationType | "event";

const renderEventContent = (userId?: number) =>
  function EventContent(eventInfo: EventContentArg) {
    const reservedByID = eventInfo.event.extendedProps?.reservedBy as
      | number
      | undefined;

    const baseColorByType: Record<EventType, string> = {
      project: "bg-res-orange",
      internship: "bg-res-orange",
      "dorsan desk": "bg-gray-300/70 !text-gray-700",
      "only running programs": "bg-gray-300/70 !text-gray-700",
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
        className={cn(
          reservationColor,
          `flex h-full w-full flex-col  rounded-sm  p-1 text-white `,
        )}
      >
        <p className="text-xs font-semibold ">
          {eventInfo.event.extendedProps.seat}
        </p>
        {/* <div className="text-xs text-center font-semibold">{eventInfo.timeText}</div> */}
        {/* <div className="truncate text-xs">{eventInfo.event.title}</div> */}
      </div>
    );
  };

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Type guard for system-only reservation types.
 * System-only means the computer system is reserved (dorsan desk / running programs)
 * but the physical seat may still be available.
 */
const isSystemOnlyHelper = (
  reservationType: EventType,
): reservationType is ReservationSystemOnly => {
  return SYSTEM_ONLY_TYPES.includes(reservationType as ReservationSystemOnly);
};

export default HomeCalendar;
