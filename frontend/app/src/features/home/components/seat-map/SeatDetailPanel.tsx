// ─── SeatDetailPanel ─────────────────────────────────────
// previous seat detail is end of this file
import React, {
  Dispatch,
  SetStateAction,
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

export function SeatDetailPanel({
  seat,
  //   status,
  // onDeselect,
  chair,
  // events,
  onAddEvent,
}: {
  seat: Seat;
  status: SeatStatus;
  onDeselect: () => void;
  chair: ChairState | undefined;
  events: CalendarEvent[] | undefined;
  onAddEvent: Dispatch<SetStateAction<CalendarEvent[]>> | undefined;
}) {
  const initialSlots = useMemo(() => {
    const data: TimeSlot[] = [];
    for (let hour = 8; hour < 14; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const timeStr = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
        let stat: SlotStatus = "available";
        if (hour === 9) stat = "mine";
        else if (hour === 10) stat = "reserved";
        else if (hour === 11) stat = "disabled";

        data.push({ id: timeStr, time: timeStr, status: stat });
      }
    }
    return data;
  }, []);

  const [startTime, setStartTime] = useState<DateObject>(
    new DateObject().set({ hour: 8, minute: 0 }),
  ); // editable
  const [endTime, setEndTime] = useState<DateObject>(
    new DateObject().set({ hour: 8, minute: 15 }),
  ); // editable

  const [selectedDate, setSelectedDate] = useState<DateObject>(
    new DateObject(),
  );

  const options = [
    { value: "A", label: "A" },
    { value: "B", label: "B" },
    { value: "C", label: "C" },
  ];

  const resetModalFields = () => {
    // setEventTitle("");
    setStartTime(new DateObject().set({ hour: 8, minute: 0 }));
    setEndTime(new DateObject().set({ hour: 8, minute: 15 }));
    // setEventLevel("Primary");
    // setSelectedEvent(null);
  };

  const mergeDateAndTime = (date: DateObject, time: DateObject): Date => {
    const merged = new Date(date.toDate()); // تبدیل به Date واقعی

    merged.setHours(time.hour, time.minute, 0, 0);

    return merged;
  };

  const handleAddOrUpdateEvent = () => {
    if (!selectedDate || !startTime || !endTime) {
      alert("همه فیلدها الزامی است");
      return;
    }

    const start = mergeDateAndTime(selectedDate, startTime);
    const end = mergeDateAndTime(selectedDate, endTime);
    // console.log("start:", start);
    // console.log("end:", end);

    if (end.getTime() <= start.getTime()) {
      alert("زمان پایان باید بعد از زمان شروع باشد");
      return;
    }

    // if (!validateWorkingHours(start) || !validateWorkingHours(end)) {
    //   alert("ساعت کاری فقط بین ۸ تا ۱۴ است");
    //   return;
    // }

    const newEventData = {
      // title: eventTitle,
      start: start.toISOString(),
      end: end.toISOString(),
      extendedProps: {
        // calendar: eventLevel,
        chair: chair,
      },
    };

    // if (selectedEvent) {
    //   onAddEvent((prev) =>
    //     prev.map((ev) =>
    //       ev.id === selectedEvent.id ? { ...ev, ...newEventData } : ev,
    //     ),
    //   );
    // } else {
    if (!onAddEvent) return;
    onAddEvent((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        ...newEventData,
        allDay: false,
      },
    ]);
    // }

    // closeModal();
    resetModalFields();
  };

  // const handleReserveClick = () => {
  // openModal();
  // };

  // console.log("end: ", endTime);

  const fullLabel = `${seat.type}${seat.number}`;

  return (
    <div className="mt-4 rounded-xl bg-gray-800 p-4 text-white shadow-lg">
      {/* Header */}
      <div className="mb-4 text-sm leading-6">
        صندلی <strong>{fullLabel}</strong>
        {/* <span className="mx-2">—</span>
        {STATUS_LABEL[status]} */}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-4">
        {/* Date Picker */}
        <div className="flex gap-2">
          <div className="w-full">
            <label className="mb-1.5 block text-sm font-medium text-gray-300">
              تاریخ رزرو
            </label>

            <DatePicker
              minDate={new DateObject()}
              maxDate={new DateObject().add(7, "days")}
              editable={false}
              value={selectedDate}
              calendar={persian}
              locale={persian_fa}
              containerStyle={{ width: "100%" }}
              inputClass="fa h-11 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm text-black"
              className="text-black"
              containerClassName="w-full"
              onChange={(v) => setSelectedDate(v as DateObject)}
            />
          </div>

          {/* Select */}
          <div className="w-full">
            <label className="mb-1.5 block text-sm font-medium text-gray-300">
              تایپ رزرویشن
            </label>

            <Select
              options={options}
              placeholder="انتخاب کنید"
              className="relative text-black"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-300">
            انتخاب زمان
          </label>

          <TimeSlotGrid
            slots={initialSlots}
            onRangeSelect={(start, end) => {
              console.log(`انتخاب بازه: ${start} تا ${end}`);
              // اینجا می‌توانید استیت‌های start و end خود را آپدیت کنید
            }}
          />
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3 pt-2 sm:flex-row">
          <button
            onClick={() => {
              resetModalFields();
            }}
            type="button"
            className="w-full rounded-lg bg-gray-600 px-4 py-3 text-sm font-medium transition hover:bg-gray-500"
          >
            بستن
          </button>

          <button
            onClick={handleAddOrUpdateEvent}
            type="button"
            className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium transition hover:bg-blue-700"
          >
            {2 == 2 ? "ویرایش رزرو" : "ثبت رزرو"}
          </button>
        </div>
      </div>
    </div>
  );
}
