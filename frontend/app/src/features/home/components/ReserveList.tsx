"use client";

import React, { useMemo } from "react";
import { SmallHoverCard } from "../../../components/common/small-cards/SmallHoverCard";
import { useActiveReservations } from "../hooks/use-get-active-reservations";

function formatTimeFa(time: string) {
  return new Intl.DateTimeFormat("fa-IR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(`1970-01-01T${time}`));
}

function formatDayFa(date: string) {
  return new Intl.DateTimeFormat("fa-IR", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

const ReserveList = () => {
  const { activeReservations, loading, error, refetch } =
    useActiveReservations();

  const groupedReservations = useMemo(() => {
    const map = new Map<string, typeof activeReservations>();

    activeReservations.forEach((reservation) => {
      if (!map.has(reservation.date)) {
        map.set(reservation.date, []);
      }
      map.get(reservation.date)!.push(reservation);
    });

    return Array.from(map.entries()).map(([date, reservations]) => ({
      date,
      label: formatDayFa(date),
      reservations: reservations.sort((a, b) =>
        a.start_time.localeCompare(b.start_time),
      ),
    }));
  }, [activeReservations]);

  return (
    <div className="fa flex h-full w-50 flex-col rounded-2xl border-2 border-gray-300 bg-white p-4">
      <p className="text-center text-2xl">رزرو های من</p>

      <div className="mt-7 flex flex-col gap-4">
        {loading && (
          <p className="text-center text-sm text-gray-500">
            در حال بارگذاری...
          </p>
        )}

        {/* {error && (
          <p className="text-center text-sm text-red-500">
            خطا در دریافت اطلاعات
          </p>
        )} */}

        {!loading && groupedReservations.length === 0 && (
          <p className="text-center text-sm text-gray-500">
            رزروی ثبت نشده است
          </p>
        )}

        {groupedReservations.map((group) => (
          <SmallHoverCard
            key={group.date}
            title={group.label}
            subTitle={`(${group.reservations.length} رزرو)`}
            hoverContent={
              <div className="max-h-72 overflow-auto p-2">
                {group.reservations.map((reservation, index) => (
                  <div
                    key={reservation.reservation_id}
                    className="mb-4 last:mb-0"
                  >
                    <h4 className="font-semibold">رزرو {index + 1}</h4>

                    <p className="text-sm text-gray-600">
                      ساعت: {formatTimeFa(reservation.start_time)} تا{" "}
                      {formatTimeFa(reservation.end_time)}
                    </p>

                    <p className="text-sm text-gray-600">
                      نوع: {reservation.reservation_type}
                    </p>

                    {index < group.reservations.length - 1 && (
                      <hr className="mt-3 border-gray-300" />
                    )}
                  </div>
                ))}
              </div>
            }
            hoverPosition="right"
            hoverContentWrapperClassName="w-64"
            hoverContentClassName="bg-blue-100 border-blue-300"
            hoverTriggerClassName="text-nowrap"
          />
        ))}
      </div>
    </div>
  );
};

export default ReserveList;
