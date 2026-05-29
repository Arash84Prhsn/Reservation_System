import React, { useState } from "react";

// وضعیت‌های ممکن برای هر اسلات
export type SlotStatus =
  | "available"
  | "reserved"
  | "selected"
  | "disabled"
  | "mine";

export interface TimeSlot {
  id: string; // e.g., "08:00"
  time: string;
  status: SlotStatus;
}

interface TimeSlotGridProps {
  onRangeSelect: (start: string, end: string) => void;
  // برای چک کردن وضعیت اسلات‌ها از بیرون (مثل دیتابیس)
  slots: TimeSlot[];
}
import clsx from "clsx"; // برای مدیریت کاندیشنال کلاس‌ها

interface TimeSlotGridProps {
  slots: TimeSlot[];
  onRangeSelect: (start: string, end: string) => void;
}

export function TimeSlotGrid({ slots, onRangeSelect }: TimeSlotGridProps) {
  const [tempStart, setTempStart] = useState<string | null>(null);
  const [tempEnd, setTempEnd] = useState<string | null>(null);

  console.log("slots: ", slots);

  const handleSlotClick = (time: string, status: SlotStatus) => {
    if (status === "reserved" || status === "disabled") return;

    if (!tempStart || (tempStart && tempEnd)) {
      // شروع یک انتخاب جدید
      setTempStart(time);
      setTempEnd(null);
    } else {
      // انتخاب پایان (باید بزرگتر از شروع باشد)
      if (time > tempStart) {
        setTempEnd(time);
        onRangeSelect(tempStart, time);
      } else {
        // اگر کاربر روی زمانی قبل از شروع کلیک کرد، آن را به عنوان شروع جدید در نظر بگیر
        setTempStart(time);
        setTempEnd(null);
      }
    }
  };

  const getSlotStyle = (slot: TimeSlot) => {
    const isSelected =
      tempStart && tempEnd
        ? slot.time >= tempStart && slot.time <= tempEnd
        : slot.time === tempStart;

    return clsx(
      "flex h-12 cursor-pointer items-center justify-center rounded-md border text-xs transition-all",
      {
        "bg-gray-700 border-gray-600 text-gray-400 cursor-not-allowed":
          slot.status === "reserved",
        "bg-red-900 border-red-700 text-red-200 cursor-not-allowed":
          slot.status === "disabled",
        "bg-green-700 border-green-500 text-white": slot.status === "mine",
        "bg-blue-600 text-white border-blue-400": isSelected, // انتخاب شده توسط کاربر
        "bg-gray-800 border-gray-600 text-gray-200 hover:border-gray-400":
          slot.status === "available" && !isSelected,
      },
    );
  };

  return (
    <div className="grid grid-cols-6 gap-2">
      {slots.map((slot) => (
        <div
          key={slot.id}
          onClick={() => handleSlotClick(slot.time, slot.status)}
          className={getSlotStyle(slot)}
        >
          {slot.time}
        </div>
      ))}
    </div>
  );
}
