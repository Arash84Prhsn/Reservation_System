"use client";

import React, { useMemo } from "react";
import { SmallHoverCard } from "../../../components/common/small-cards/SmallHoverCard"; // مسیر این کامپوننت را چک کن
import { CalendarEvent } from "@/app/type"; // مسیر این تایپ را چک کن
import { SeatType } from "@/lib/api/services/reservation.service";
import { DesktopSeat } from "@/app/(admin)/page";
// import { SmallBaseCard } from "./SmallBaseCard"; // مسیر این کامپوننت را چک کن
// import { cn } from "@/utilities/cn"; // مسیر این تابع را چک کن

type ReserveListProps = {
  events: CalendarEvent[];
};

// تابع فرمت زمان شمسی
function formatTimeFa(dateValue?: string | Date | null): string {
  if (!dateValue) return "--:--";
  try {
    const date = new Date(dateValue);
    return new Intl.DateTimeFormat("fa-IR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(date);
  } catch (error) {
    console.error("Error formatting time:", dateValue, error);
    return "--:--";
  }
}

// تابع فرمت روز و تاریخ شمسی
function formatDayFa(dateValue?: string | Date | null): string {
  if (!dateValue) return "تاریخ نامشخص";
  try {
    const date = new Date(dateValue);
    // چون allDay: false است، روز هفته و تاریخ را نمایش می‌دهیم
    return new Intl.DateTimeFormat("fa-IR", {
      weekday: "long",
      // year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  } catch (error) {
    console.error("Error formatting day:", dateValue, error);
    return "تاریخ نامشخص";
  }
}

// تابع برای گرفتن لیبل صندلی (با فرض اینکه chair وجود دارد)
// اگر chair در داده‌های واقعی شما نیست، این تابع و فراخوانی آن را حذف کن
function getSeatLabel(seat?: DesktopSeat): string {
  if (!seat) return "نامشخص";
  return `${seat.type}${seat.number}`;
}

const ReserveList = ({ events }: ReserveListProps) => {
  // گروه‌بندی رویدادها بر اساس روز
  const groupedEvents = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();

    events.forEach((event) => {
      // استفاده از start برای کلید گروه‌بندی
      const dayKey = event.start
        ? new Date(event.start as string | Date).toDateString() // استفاده از toDateString برای مقایسه فقط تاریخ
        : "unknown";

      if (!map.has(dayKey)) {
        map.set(dayKey, []);
      }
      map.get(dayKey)!.push(event);
    });

    // تبدیل Map به آرایه و آماده‌سازی برای نمایش
    return Array.from(map.entries()).map(([dayKey, dayEvents]) => ({
      dayKey,
      // استفاده از اولین رویداد روز برای گرفتن لیبل تاریخ
      dayLabel:
        dayKey === "unknown"
          ? "بدون تاریخ"
          : formatDayFa(String(dayEvents[0]?.start)),
      events: dayEvents.sort((a, b) => {
        // مرتب‌سازی رویدادهای هر روز بر اساس زمان شروع
        const dateA = a.start ? new Date(a.start as string | Date) : null;
        const dateB = b.start ? new Date(b.start as string | Date) : null;
        if (!dateA && !dateB) return 0;
        if (!dateA) return 1; // a بعد از b
        if (!dateB) return -1; // b بعد از a
        return dateA.getTime() - dateB.getTime();
      }),
    }));
  }, [events]);

  return (
    // این div والد باید کلاس های tailwind که برای ReserveList لازم است را داشته باشد
    // مثال: className="flex h-full w-50 flex-col rounded-2xl border-2 border-gray-300 bg-white p-4"
    <div className="flex h-full w-50 flex-col rounded-2xl border-2 border-gray-300 bg-white p-4">
      <p className="text-center text-2xl">رزرو های من</p>

      <div className="mt-7 flex flex-col gap-4">
        {" "}
        {/* gap افزایش یافت */}
        {groupedEvents.length === 0 ? (
          <p className="text-center text-sm text-gray-500">
            رزروی ثبت نشده است.
          </p>
        ) : (
          groupedEvents.map((group) => (
            <SmallHoverCard
              key={group.dayKey} // استفاده از dayKey برای کلید یکتا
              // Title کارت: تاریخ روز + تعداد رزروهای آن روز
              title={`${group.dayLabel} `}
              subTitle={`(${group.events.length} رزرو)`}
              // محتوای داخل هاور (لیست رزروها)
              hoverContent={
                <div className="fa max-h-72 overflow-auto p-2">
                  {" "}
                  {/* p-2 برای padding داخلی */}
                  {group.events.map((event, index) => (
                    <div key={event.id || index} className="mb-4 last:mb-0">
                      <h4 className="font-semibold">رزرو {index + 1}</h4>

                      {/* نمایش عنوان رویداد */}
                      {event.title && (
                        <p className="text-sm text-gray-600">
                          عنوان: {event.title}
                        </p>
                      )}

                      {/* نمایش ساعت شروع و پایان */}
                      <p className="text-sm text-gray-600">
                        ساعت: {formatTimeFa(String(event.start))} تا{" "}
                        {formatTimeFa(String(event.end))}
                      </p>

                      {/* نمایش صندلی - در صورتی که extendedProps.seat وجود داشته باشد */}
                      {event.extendedProps?.seat && (
                        <p className="text-sm text-gray-600">
                          صندلی: {getSeatLabel(event.extendedProps.seat)}
                        </p>
                      )}

                      {/* نمایش تقویم - در صورتی که extendedProps.calendar وجود داشته باشد */}
                      {/* {event.extendedProps?.calendar && (
                        <p className="text-sm text-gray-600">
                          تقویم: {event.extendedProps.calendar}
                        </p>
                      )} */}

                      {/* خط جداکننده بین رزروها */}
                      {index < group.events.length - 1 && (
                        <hr className="mt-3 border-gray-300" />
                      )}
                    </div>
                  ))}
                </div>
              }
              // پراپ‌های دیگر SmallHoverCard
              hoverPosition="right" // یا هر پوزیشن دیگری که لازم دارید
              hoverContentWrapperClassName="w-64" // کلاس برای wrapper محتوای هاور (اندازه)
              hoverContentClassName="bg-blue-100 border-blue-300" // کلاس برای خود محتوای هاور
              hoverTriggerClassName="text-nowrap"
              // بقیه props که به SmallBaseCard پاس داده می‌شوند
              // مثلاً title و ...
              // اینجا title را به SmallBaseCard پاس نمی‌دهیم چون خودش در hoverContent نمایش داده می‌شود
              // اگر SmallBaseCard نیاز به title جداگانه دارد، باید آن را اینجا هم پاس دهی
              // baseProps را اینجا استفاده کن
              // baseProps={{ title: group.dayLabel }} // مثال: اگر title برای SmallBaseCard لازم است
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ReserveList;
