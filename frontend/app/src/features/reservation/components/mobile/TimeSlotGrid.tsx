export type SlotStatus = "selected" | ScheduleSlotStatus;

export interface TimeSlot {
  id: string;
  time: string;
  startTime?: string;
  endTime?: string;
  status: SlotStatus;
  systemOnly?: boolean;
}

interface TimeSlotGridProps {
  slots: TimeSlot[];

  startTime: string;
  endTime: string;

  setStartTime: (time: string) => void;
  setEndTime: (time: string) => void;

  onRangeSelect?: (start: string, end: string) => void;
}
import { ScheduleSlotStatus } from "../../api";
import clsx from "clsx"; // برای مدیریت کاندیشنال کلاس‌ها
import { formatPersianTime } from "@/features/reservation/utils/date";

export function TimeSlotGrid({
  slots,
  onRangeSelect,
  startTime,
  endTime,
  setStartTime,
  setEndTime,
}: TimeSlotGridProps) {
  const handleSlotClick = (slot: TimeSlot) => {
    const { status, systemOnly = false, time } = slot;
    const slotStart = slot.startTime || time;
    const slotEnd = slot.endTime || time;

    if (
      (status === "reserved_by_others" && !systemOnly) ||
      status === "reserved_by_user" ||
      status === "reserved_by_user_with_system_reservation" ||
      status === "reserved_by_others_with_system_reservation" ||
      status === "event"
    )
      return;

    if (!startTime || (startTime && endTime)) {
      // شروع یک انتخاب جدید
      setStartTime(slotStart);
      setEndTime("");
      return;
    } else {
      // انتخاب پایان
      if (slotStart > startTime) {
        // زمانی که کاربر روی اسلات بعد از شروع کلیک می‌کند، پایان باید زمان پایان آن اسلات باشد
        setEndTime(slotEnd);
        onRangeSelect?.(startTime, slotEnd);
      } else if (slotStart === startTime) {
        // کلیک دوباره روی همان اسلات، بازه را به همان تک‌اسلات تنظیم می‌کند
        setEndTime(slotEnd);
        onRangeSelect?.(startTime, slotEnd);
      } else {
        // اگر کاربر روی زمانی قبل از شروع کلیک کرد، آن را به عنوان شروع جدید در نظر بگیر
        setStartTime(slotStart);
        setEndTime("");
      }
    }
  };

  const getSlotStyle = (slot: TimeSlot) => {
    const slotStart = slot.startTime || slot.time;
    const slotEnd = slot.endTime || slot.time;

    const isSelected =
      startTime && endTime
        ? slotStart >= startTime && slotEnd <= endTime
        : slotStart === startTime;

    const isSystemOnly = slot.systemOnly === true;

    return clsx(
      "flex h-12 cursor-pointer items-center justify-center rounded-lg border text-xs font-medium transition-all duration-150 active:scale-95",
      {
        "bg-res-red text-white cursor-not-allowed opacity-80":
          slot.status === "event" && !isSystemOnly,
        "bg-res-orange text-white cursor-not-allowed opacity-80":
          slot.status === "reserved_by_others" && !slot.systemOnly,
        "bg-res-green-success text-white font-semibold": slot.status === "reserved_by_user",
        "bg-res-gray-dark/30 text-gray-700 dark:text-gray-200 hover:bg-res-gray-dark/50": isSystemOnly && !isSelected,
        "bg-blue-500 text-white font-bold ring-2 ring-blue-400 ring-offset-1 shadow-md scale-[1.03] z-10": isSelected,
        "bg-white text-gray-800 hover:bg-emerald-50 hover:border-emerald-300 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700":
          slot.status === "free" && !isSelected && !isSystemOnly,
        "bg-gradient-to-r from-res-gray-dark/30 from-50% to-res-green-success to-50% text-white":
          slot.status === "reserved_by_user_with_system_reservation",
        "bg-gradient-to-r from-res-gray-dark/30 from-50% to-res-orange to-50% text-white":
          slot.status === "reserved_by_others_with_system_reservation",
      },
    );
  };

  return (
    <div className="grid grid-cols-6 gap-2">
      {slots.map((slot) => (
        <button
          key={slot.id}
          type="button"
          onClick={() => handleSlotClick(slot)}
          className={getSlotStyle(slot)}
          disabled={
            (slot.status === "reserved_by_others" && !slot.systemOnly) ||
            slot.status === "reserved_by_user" ||
            slot.status === "reserved_by_user_with_system_reservation" ||
            slot.status === "reserved_by_others_with_system_reservation" ||
            slot.status === "event"
          }
        >
          {formatPersianTime(slot.time)}
        </button>
      ))}
    </div>
  );
}
