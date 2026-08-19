"use client";

import React from "react";
import { GiOfficeChair } from "react-icons/gi";
import { BsCheckCircleFill } from "react-icons/bs";

import { cn, toPersianDigits } from "@/shared/lib/utils";
import { DesktopSeat } from "@/features/reservation/types";

type SeatListParams = {
  seat: DesktopSeat | null;
  onChairSelect: (inputSeat: DesktopSeat) => void;
};

type SeatGroup = {
  title: string;
  type: DesktopSeat["type"] | "admin";
  prefix: "D" | "O" | "L" | "admin";
  persianPrefix: string;
  count: number;
  isAdmin?: boolean;
};

const chairGroups: SeatGroup[] = [
  {
    title: "سیستم داتین",
    type: "dotin",
    prefix: "D",
    persianPrefix: "داتین",
    count: 4,
  },
  {
    title: "سیستم بهینه‌سازی",
    type: "optimization",
    prefix: "O",
    persianPrefix: "بهینه‌سازی",
    count: 2,
  },
  {
    title: "میز لپ‌تاپ",
    type: "laptop",
    prefix: "L",
    persianPrefix: "لپ‌تاپ",
    count: 3,
  },
  {
    title: "مدیریت آزمایشگاه",
    type: "admin",
    prefix: "admin",
    persianPrefix: "مدیر",
    count: 1,
    isAdmin: true,
  },
];

const SeatList = ({ seat, onChairSelect }: SeatListParams) => {
  return (
    <div className="h-[calc(100vh-130px)] flex w-64 flex-col rounded-2xl border border-gray-200 bg-white/90 p-3 shadow-sm backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/90 overflow-hidden shrink-0">
      {/* Header */}
      <div className="border-b border-gray-100 pb-2 dark:border-gray-800 shrink-0" dir="rtl">
        <div className="flex items-center justify-center">
          <h2 className="text-base font-bold text-gray-800 dark:text-gray-100">
            انتخاب صندلی
          </h2>
        </div>
      </div>

      {/* Groups Container - Dynamically fills 100% of the available card height */}
      <div className="mt-2.5 flex-1 flex flex-col gap-10 overflow-hidden no-scrollbar min-h-0" dir="rtl">
        {chairGroups.map((group) => {
          const isSelectedGroup = seat?.type === group.type;

          return (
            <div
              key={group.type}
              style={{ flex: group.count }}
              className="flex flex-col min-h-0"
            >
              {/* Group Title */}
              <div className="flex items-center justify-between px-0.5 pb-0.5 shrink-0">
                <span className="font-bold text-xs text-gray-600 dark:text-gray-300">
                  {group.title}
                </span>
              </div>

              {/* Seat Cards Grid - Each button expands dynamically */}
              <div className="flex-1 flex flex-col gap-1 min-h-0 mt-2">
                {Array.from({ length: group.count }, (_, index) => {
                  const chairNumber = index + 1;
                  const chairId = `${group.prefix}${chairNumber}`;
                  const displayTitle = group.isAdmin
                    ? "جایگاه مدیر"
                    : `${group.persianPrefix} ${toPersianDigits(chairNumber)}`;
                  const isSelected = isSelectedGroup && seat?.number === chairNumber;

                  return (
                    <button
                      key={chairId}
                      type="button"
                      disabled={group.isAdmin}
                      onClick={() => {
                        if (!group.isAdmin) {
                          onChairSelect({
                            type: group.type as DesktopSeat["type"],
                            number: chairNumber,
                          });
                        }
                      }}
                      className={cn(
                        "group relative flex flex-1 min-h-0 w-full items-center justify-between rounded-xl border px-2.5 py-1 text-right transition-colors duration-150 box-border",
                        group.isAdmin
                          ? "cursor-not-allowed bg-gray-50/60 opacity-60 dark:bg-gray-800/40 border-gray-200"
                          : isSelected
                            ? "border-blue-500 bg-blue-50/90 ring-2 ring-blue-400/40 shadow-2xs border-r-4 border-r-blue-600 dark:bg-blue-950/50 dark:border-blue-500 dark:border-r-blue-400"
                            : "border-gray-200/80 bg-gray-50/50 hover:bg-white hover:border-blue-300 hover:shadow-2xs dark:bg-gray-800/40 dark:border-gray-700/60 dark:hover:bg-gray-800",
                      )}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className={cn(
                            "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors",
                            isSelected
                              ? "bg-blue-600 text-white shadow-2xs"
                              : "bg-gray-100 text-gray-500 group-hover:bg-blue-50 group-hover:text-blue-600 dark:bg-gray-700/50 dark:text-gray-400",
                          )}
                        >
                          <GiOfficeChair size={15} />
                        </div>

                        <span className="truncate text-sm font-bold text-gray-900 dark:text-gray-100">
                          {displayTitle}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[11px] text-gray-400 dark:text-gray-500 font-medium">
                          {group.isAdmin ? "غیرقابل رزرو" : `${group.prefix}-${toPersianDigits(chairNumber)}`}
                        </span>

                        {isSelected && (
                          <BsCheckCircleFill className="text-blue-600 dark:text-blue-400" size={14} />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SeatList;