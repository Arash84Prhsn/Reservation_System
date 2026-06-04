export type SlotStatus = "selected" | ScheduleSlotStatus;

export interface TimeSlot {
  id: string; // e.g., "08:00"
  time: string;
  status: SlotStatus;
}

interface TimeSlotGridProps {
  slots: TimeSlot[];

  startTime: string;
  endTime: string;

  setStartTime: (time: string) => void;
  setEndTime: (time: string) => void;

  onRangeSelect?: (start: string, end: string) => void;
}
import { ScheduleSlotStatus } from "@/lib/api/services/reservation.service";
import clsx from "clsx"; // برای مدیریت کاندیشنال کلاس‌ها

export function TimeSlotGrid({
  slots,
  onRangeSelect,
  startTime,
  endTime,
  setStartTime,
  setEndTime,
}: TimeSlotGridProps) {
  // console.log("slots: ", slots);

  const handleSlotClick = (time: string, status: SlotStatus) => {
    if (
      status === "reserved_by_others" ||
      status === "reserved_by_user" ||
      status === "event"
    )
      return;

    if (!startTime || (startTime && endTime)) {
      // شروع یک انتخاب جدید
      setStartTime(time);
      setEndTime("");
      return;
    } else {
      // انتخاب پایان (باید بزرگتر از شروع باشد)
      if (time > startTime) {
        setEndTime(time);
        onRangeSelect?.(startTime, time);
      } else {
        // اگر کاربر روی زمانی قبل از شروع کلیک کرد، آن را به عنوان شروع جدید در نظر بگیر
        setStartTime(time);
        setEndTime("");
      }
    }
  };

  const getSlotStyle = (slot: TimeSlot) => {
    const isSelected =
      startTime && endTime
        ? slot.time >= startTime && slot.time <= endTime
        : slot.time === startTime;

    return clsx(
      "flex h-12 cursor-pointer items-center justify-center rounded-md border text-xs transition-all",
      {
        "bg-gray-700 border-gray-600 text-gray-400 cursor-not-allowed":
          slot.status === "event",
        "bg-purple-900 border-purple-700 text-purple-200 cursor-not-allowed":
          slot.status === "reserved_by_others",
        "bg-blue-700/60 border-blue-500 text-white":
          slot.status === "reserved_by_user",
        "bg-blue-600 text-white border-blue-400": isSelected, // انتخاب شده توسط کاربر
        "bg-gray-800 border-gray-600 text-gray-200 hover:border-gray-400":
          slot.status === "free" && !isSelected,
      },
    );
  };

  return (
    <div className="grid grid-cols-6 gap-2">
      {slots.map((slot) => (
        <button
          key={slot.id}
          type="button"
          onClick={() => handleSlotClick(slot.time, slot.status)}
          className={getSlotStyle(slot)}
          disabled={
            slot.status === "reserved_by_others" ||
            slot.status === "reserved_by_user" ||
            slot.status === "event"
          }
        >
          {slot.time}
        </button>
      ))}
    </div>
  );
}
