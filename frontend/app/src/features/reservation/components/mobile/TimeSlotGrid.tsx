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
import { ScheduleSlotStatus } from "@/lib/api/services/reservation.service";
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
      "flex h-12 cursor-pointer items-center justify-center rounded-md border text-xs transition-all",
      {
        "bg-res-red text-white cursor-not-allowed":
          slot.status === "event" && !isSystemOnly,
        "bg-res-orange text-white cursor-not-allowed":
          slot.status === "reserved_by_others" && !slot.systemOnly,
        "bg-res-green-success  text-white": slot.status === "reserved_by_user",
        "bg-res-gray-dark/30 text-white": isSystemOnly && !isSelected,
        "bg-blue-400 text-white font-semibold shadow-sm": isSelected,
        "bg-white text-gray-800 ":
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
