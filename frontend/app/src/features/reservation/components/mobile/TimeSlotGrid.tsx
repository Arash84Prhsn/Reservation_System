import { ScheduleSlotStatus } from "../../api";
import { formatPersianTime } from "@/features/reservation/utils/date";
import clsx from "clsx";
import { toast } from "sonner";

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

function isSelectableSlot(slot: TimeSlot) {
  return (
    slot.status === "free" ||
    (slot.status === "reserved_by_others" && slot.systemOnly === true)
  );
}

export function TimeSlotGrid({
  slots,
  onRangeSelect,
  startTime,
  endTime,
  setStartTime,
  setEndTime,
}: TimeSlotGridProps) {
  const handleSlotClick = (slot: TimeSlot) => {
    if (!isSelectableSlot(slot)) return;

    const slotStart = slot.startTime || slot.time;
    const slotEnd = slot.endTime || slot.time;

    if (!startTime || endTime) {
      setStartTime(slotStart);
      setEndTime("");
      return;
    }

    if (slotStart < startTime) {
      setStartTime(slotStart);
      setEndTime("");
      return;
    }

    const startIndex = slots.findIndex(
      (candidate) => (candidate.startTime || candidate.time) === startTime,
    );
    const endIndex = slots.findIndex((candidate) => candidate.id === slot.id);

    if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
      setStartTime(slotStart);
      setEndTime("");
      return;
    }

    const range = slots.slice(startIndex, endIndex + 1);
    if (!range.every(isSelectableSlot)) {
      toast.warning("بازه انتخابی شامل زمان رزروشده یا غیرقابل استفاده است");
      return;
    }

    setEndTime(slotEnd);
    onRangeSelect?.(startTime, slotEnd);
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
        "cursor-not-allowed bg-res-red text-white opacity-80":
          slot.status === "event" && !isSystemOnly,
        "cursor-not-allowed bg-res-orange text-white opacity-80":
          slot.status === "reserved_by_others" && !slot.systemOnly,
        "bg-res-green-success font-semibold text-white":
          slot.status === "reserved_by_user",
        "bg-res-gray-dark/30 text-gray-700 hover:bg-res-gray-dark/50 dark:text-gray-200":
          isSystemOnly && !isSelected,
        "z-10 scale-[1.03] bg-blue-500 font-bold text-white shadow-md ring-2 ring-blue-400 ring-offset-1":
          isSelected,
        "bg-white text-gray-800 hover:border-emerald-300 hover:bg-emerald-50 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700":
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
          disabled={!isSelectableSlot(slot)}
          aria-label={`${formatPersianTime(slot.time)} - ${
            isSelectableSlot(slot) ? "قابل انتخاب" : "غیرقابل انتخاب"
          }`}
        >
          {formatPersianTime(slot.time)}
        </button>
      ))}
    </div>
  );
}
