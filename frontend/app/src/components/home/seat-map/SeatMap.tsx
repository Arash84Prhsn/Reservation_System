// SeatMap.tsx

import React, {
  Dispatch,
  SetStateAction,
  useMemo,
  useRef,
  useState,
} from "react";
import { SeatComponent } from "./Seat";
import { useSeatMap, useSelectedSeat } from "./SeatMap.utils";
import {
  STATUS_LABEL,
  type SeatMapConfig,
  type SeatData,
  type SeatStatus,
} from "./SeatMap.config";
import DatePicker, { DateObject } from "react-multi-date-picker";
import { CalendarEvent, ChairState } from "@/app/type";
import Select from "@/components/form/Select";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import faLocale from "@fullcalendar/core/locales/fa";
import TimePicker from "react-multi-date-picker/plugins/time_picker";
import { Table } from "./Table";
import { SlotStatus, TimeSlot, TimeSlotGrid } from "./TimeSlotGrid";

interface SeatMapProps {
  config?: SeatMapConfig;
  data?: SeatData[];
  chair: ChairState;
  events: CalendarEvent[];
  onAddEvent: Dispatch<SetStateAction<CalendarEvent[]>>;
}

// ─── SeatDetailPanel ─────────────────────────────────────
// previous seat detail is end of this file

function SeatDetailPanel({
  seatId,
  status,
  onDeselect,
  chair,
  events,
  onAddEvent,
}: {
  seatId: string;
  status: SeatStatus;
  onDeselect: () => void;
  chair: ChairState;
  events: CalendarEvent[];
  onAddEvent: Dispatch<SetStateAction<CalendarEvent[]>>;
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

  const handleReserveClick = () => {
    // openModal();
  };

  // console.log("end: ", endTime);

  return (
    <div className="mt-4 rounded-xl bg-gray-800 p-4 text-white shadow-lg">
      {/* Header */}
      <div className="mb-4 text-sm leading-6">
        صندلی <strong>{seatId}</strong>
        <span className="mx-2">—</span>
        {STATUS_LABEL[status]}
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

// ─── SeatMap (main) ──────────────────────────────────────
export default function SeatMap({
  config,
  data,
  chair,
  events,
  onAddEvent,
}: SeatMapProps) {
  const { seats, config: mergedConfig } = useSeatMap({ config, data });
  const { selectedId, select, deselect, isSelected } = useSelectedSeat();

  const countBySide = {
    top: mergedConfig.top,
    bottom: mergedConfig.bottom,
    left: mergedConfig.left,
    right: mergedConfig.right,
  };

  const selectedSeat = selectedId
    ? seats.find((s) => s.id === selectedId)
    : null;

  return (
    <div
      className="mx-auto w-full max-w-sm rounded-2xl bg-amber-600/50 p-4"
      dir="rtl"
    >
      <div className="relative w-full" style={{ paddingBottom: "100%" }}>
        <div className="absolute inset-0">
          <Table />
          {seats.map((seat) => (
            <SeatComponent
              key={seat.id}
              // selectable={Number(seat.id) === 0}
              seat={seat}
              total={countBySide[seat.side]}
              isSelected={isSelected(seat.id)}
              onSelect={select}
            />
          ))}
        </div>
      </div>

      {selectedSeat && (
        <SeatDetailPanel
          seatId={selectedSeat.id}
          status={selectedSeat.status}
          onDeselect={deselect}
          chair={chair}
          events={events}
          onAddEvent={onAddEvent}
        />
      )}
    </div>
  );
}

// function SeatDetailPanel({
//   seatId,
//   status,
//   onDeselect,
//   chair,
//   events,
//   onAddEvent,
// }: {
//   seatId: string;
//   status: SeatStatus;
//   onDeselect: () => void;
//   chair: ChairState;
//   events: CalendarEvent[];
//   onAddEvent: Dispatch<SetStateAction<CalendarEvent[]>>;
// }) {
//   const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
//     null,
//   );

//   const [eventTitle, setEventTitle] = useState("");

//   const [startTime, setStartTime] = useState<DateObject>(
//     new DateObject().set({ hour: 8, minute: 0 }),
//   ); // editable
//   const [endTime, setEndTime] = useState<DateObject>(
//     new DateObject().set({ hour: 8, minute: 15 }),
//   ); // editable

//   const [selectedDate, setSelectedDate] = useState<DateObject>(
//     new DateObject(),
//   );

//   // const [eventLevel, setEventLevel] = useState("Primary");
//   const { isOpen, openModal, closeModal } = useModal();

//   // to prevent time picker to change date when it is NOT valid.
//   const previousValidStartRef = useRef<DateObject>(startTime);
//   const previousValidEndRef = useRef<DateObject>(endTime);

//   const options = [
//     { value: "A", label: "A" },
//     { value: "B", label: "B" },
//     { value: "C", label: "C" },
//   ];

//   const resetModalFields = () => {
//     // setEventTitle("");
//     setStartTime(new DateObject().set({ hour: 8, minute: 0 }));
//     setEndTime(new DateObject().set({ hour: 8, minute: 15 }));
//     // setEventLevel("Primary");
//     // setSelectedEvent(null);
//   };

//   const isValidWorkingTime = (date: DateObject) => {
//     const js = date.toDate();
//     const hour = js.getHours();

//     return hour >= 8 && hour < 14;
//   };

//   const validateWorkingHours = (date: Date) => {
//     const hour = date.getHours();
//     return hour >= 8 && hour < 14;
//   };

//   const mergeDateAndTime = (date: DateObject, time: DateObject): Date => {
//     const merged = new Date(date.toDate()); // تبدیل به Date واقعی

//     merged.setHours(time.hour, time.minute, 0, 0);

//     return merged;
//   };

//   const handleAddOrUpdateEvent = () => {
//     if (!selectedDate || !startTime || !endTime) {
//       alert("همه فیلدها الزامی است");
//       return;
//     }

//     const start = mergeDateAndTime(selectedDate, startTime);
//     const end = mergeDateAndTime(selectedDate, endTime);
//     // console.log("start:", start);
//     // console.log("end:", end);

//     if (end.getTime() <= start.getTime()) {
//       alert("زمان پایان باید بعد از زمان شروع باشد");
//       return;
//     }

//     if (!validateWorkingHours(start) || !validateWorkingHours(end)) {
//       alert("ساعت کاری فقط بین ۸ تا ۱۴ است");
//       return;
//     }

//     const newEventData = {
//       title: eventTitle,
//       start: start.toISOString(),
//       end: end.toISOString(),
//       extendedProps: {
//         // calendar: eventLevel,
//         chair: chair,
//       },
//     };

//     // if (selectedEvent) {
//     //   onAddEvent((prev) =>
//     //     prev.map((ev) =>
//     //       ev.id === selectedEvent.id ? { ...ev, ...newEventData } : ev,
//     //     ),
//     //   );
//     // } else {
//     onAddEvent((prev) => [
//       ...prev,
//       {
//         id: Date.now().toString(),
//         ...newEventData,
//         allDay: false,
//       },
//     ]);
//     // }

//     closeModal();
//     resetModalFields();
//   };

//   const handleReserveClick = () => {
//     // const event = clickInfo.event;

//     // setSelectedEvent(event as unknown as CalendarEvent);

//     // setEventTitle(event.title);

//     // const start = startTime ? new DateObject(startTime) : null;
//     // const end = endTime ? new DateObject(endTime) : null;

//     // تبدیل Date معمولی به DateObject
//     // if (start) {
//     //   setSelectedDate(new DateObject(start));
//     //   setStartTime(new DateObject(start));
//     // }

//     // if (end) setEndTime(new DateObject(end));
//     // previousValidStartRef.current = start;
//     // previousValidEndRef.current = end;

//     // setEventLevel(event.extendedProps.calendar || "Primary");

//     openModal();
//   };

//   // console.log("end: ", endTime);

//   return (
//     <div className="mt-4 flex items-center justify-between rounded-lg bg-gray-800 p-3 text-sm text-white">
//       <span>
//         صندلی <strong>{seatId}</strong> — {STATUS_LABEL[status]}
//       </span>
//       <div className="flex gap-2">
//         <button
//           onClick={onDeselect}
//           className="rounded bg-gray-600 px-2 py-1 text-xs hover:bg-gray-500"
//         >
//           لغو انتخاب
//         </button>
//         <button
//           onClick={handleReserveClick}
//           className="rounded bg-blue-600 px-2 py-1 text-xs hover:bg-gray-500"
//         >
//           رزرو صندلی
//         </button>
//       </div>
//       <Modal
//         isOpen={isOpen}
//         onClose={() => {
//           closeModal();
//           resetModalFields();
//         }}
//         className="w-[95vw] max-w-[700px] overflow-visible p-4 sm:p-6 lg:p-10"
//       >
//         <div className="relative flex flex-col overflow-visible px-2">
//           <div>
//             <h5 className="mb-4 text-xl font-semibold text-gray-800 sm:text-2xl dark:text-white/90">
//               {selectedEvent ? "تغییر رزرو" : "رزرو جدید"}
//             </h5>
//           </div>

//           <div className="mt-4 sm:mt-8">
//             {/* title */}
//             <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
//               <div className="w-full">
//                 <label className="mb-1.5 block font-medium text-gray-700 dark:text-gray-400">
//                   تاریخ انتخابی
//                 </label>
//                 <DatePicker
//                   minDate={new DateObject()} //Today
//                   maxDate={new DateObject().add(7, "days")}
//                   editable={false}
//                   value={selectedDate}
//                   // disableDayPicker
//                   // format="HH:mm"
//                   calendar={persian}
//                   locale={persian_fa}
//                   containerStyle={{ width: "100%" }}
//                   inputClass="fa h-11 w-full rounded-lg border border-gray-300 px-4 text-sm "
//                   className="text-black"
//                   containerClassName="text-black"
//                   onChange={(v) => setSelectedDate(v as DateObject)}
//                 />
//                 {/* <div className="h-11 w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-600">
//                   {selectedDate?.format("YYYY/MM/DD")}

//                 </div> */}
//               </div>
//               <div className="w-full">
//                 <label className="mb-1.5 block font-medium text-gray-700 dark:text-gray-400">
//                   تایپ رزرویشن
//                 </label>
//                 <Select
//                   options={options}
//                   placeholder="انتخاب کنید"
//                   onChange={(value) => setEventTitle(value)}
//                   className="dark:bg-dark-900 relative"
//                 />
//               </div>
//             </div>

//             {/* dates */}
//             <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:gap-10">
//               {/* start */}
//               <div className="w-full">
//                 <div>
//                   <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
//                     زمان شروع
//                   </label>

//                   <DatePicker
//                     editable={false}
//                     value={startTime} // فقط استیت را مستقیم بدهید
//                     disableDayPicker
//                     format="HH:mm"
//                     calendar={persian}
//                     locale={persian_fa}
//                     containerStyle={{ width: "100%" }}
//                     inputClass="fa h-11 w-full rounded-lg border border-gray-300 px-4 text-sm "
//                     className="text-black"
//                     containerClassName="text-black"
//                     plugins={[
//                       <TimePicker key="start-time" hideSeconds mStep={15} />,
//                     ]}
//                     onChange={(time) => {
//                       if (!time) return;

//                       if (!isValidWorkingTime(time)) {
//                         alert("ساعت فقط بین ۸ تا ۱۴ قابل انتخاب است");

//                         // برگرداندن به مقدار معتبر قبلی (اگر وجود داشت)
//                         if (previousValidStartRef.current) {
//                           setStartTime(
//                             new DateObject(previousValidStartRef.current),
//                           );
//                         }
//                       } else {
//                         // ذخیره مقدار جدید به عنوان معتبر
//                         previousValidStartRef.current = new DateObject(time);
//                         setStartTime(time);
//                       }
//                     }}
//                   />
//                 </div>
//               </div>

//               {/* end */}
//               <div className="w-full">
//                 <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
//                   زمان پایان
//                 </label>

//                 <DatePicker
//                   editable={false}
//                   value={
//                     endTime
//                       ? new DateObject().set({
//                           hour: endTime.hour,
//                           minute: endTime.minute,
//                         })
//                       : null
//                   }
//                   disableDayPicker
//                   format="HH:mm"
//                   calendar={persian}
//                   locale={persian_fa}
//                   containerStyle={{ width: "100%" }}
//                   inputClass="fa h-11 w-full rounded-lg border border-gray-300 px-4 text-sm"
//                   className="text-black"
//                   containerClassName="text-black"
//                   plugins={[
//                     <TimePicker key="end-time" hideSeconds mStep={15} />,
//                   ]}
//                   onChange={(time) => {
//                     if (!time) return;

//                     if (!isValidWorkingTime(time)) {
//                       alert("ساعت فقط بین ۸ تا ۱۴ قابل انتخاب است");

//                       // برگرداندن به مقدار معتبر قبلی (اگر وجود داشت)
//                       if (previousValidEndRef.current) {
//                         setEndTime(new DateObject(previousValidEndRef.current));
//                       }
//                     } else {
//                       // ذخیره مقدار جدید به عنوان معتبر
//                       previousValidEndRef.current = new DateObject(time);
//                       setEndTime(time);
//                     }
//                   }}
//                 />
//               </div>
//             </div>
//           </div>

//           {/* footer */}
//           <div className="mt-8 flex items-center gap-3 sm:flex-row">
//             <button
//               onClick={() => {
//                 closeModal();
//                 resetModalFields();
//               }}
//               type="button"
//               className="bg-brand-500 hover:bg-brand-600 w-full rounded-lg px-6 py-2.5 text-sm font-medium text-white"
//             >
//               بستن
//             </button>
//             <button
//               onClick={handleAddOrUpdateEvent}
//               type="button"
//               className="bg-brand-500 hover:bg-brand-600 w-full rounded-lg px-4 py-2.5 text-sm font-medium text-white"
//             >
//               {selectedEvent ? "ویرایش رزرو" : "ثبت رزرو"}
//             </button>
//           </div>
//         </div>
//       </Modal>
//     </div>
//   );
// }
