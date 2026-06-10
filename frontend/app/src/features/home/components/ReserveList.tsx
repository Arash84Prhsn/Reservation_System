"use client";

import React, { useMemo, useState } from "react";
import { SmallHoverCard } from "../../../components/common/small-cards/SmallHoverCard";
import { useActiveReservations } from "../hooks/use-get-active-reservations";
import { useCancelReservationById } from "../hooks/use-cancel-reservation-by-id";
import { toast } from "sonner";
import {
  ActiveReservations,
  CancelReservationByIdResponse,
} from "@/lib/api/services/reservation.service";
import { UseMutateAsyncFunction } from "@tanstack/react-query";

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
  const { activeReservations, loading, error } = useActiveReservations();
  const { cancelReservation, pending } = useCancelReservationById();

  const [deletingReservationId, setDeletingReservationId] = useState<
    number | null
  >(null);

  const groupedReservations = useMemo(() => {
    const map = new Map<string, ActiveReservations[]>();

    activeReservations.forEach((reservation) => {
      if (!map.has(reservation.date)) {
        map.set(reservation.date, []);
      }

      map.get(reservation.date)!.push(reservation);
    });

    return Array.from(map.entries()).map(([date, reservations]) => ({
      date,
      label: formatDayFa(date),
      reservations: [...reservations].sort((a, b) =>
        a.start_time.localeCompare(b.start_time),
      ),
    }));
  }, [activeReservations]);

  const handleCancelReservation = async (reservationId: number) => {
    const confirmed = window.confirm("آیا از حذف این رزرو مطمئن هستید؟");
    if (!confirmed) return;

    try {
      setDeletingReservationId(reservationId);
      await cancelReservation(reservationId);
    } catch {
      toast.error("حذف رزرو انجام نشد");
    } finally {
      setDeletingReservationId(null);
    }
  };

  const commonProps = {
    groupedReservations,
    pending,
    deletingReservationId,
    loading,
    error,
    cancelReservation,
    handleCancelReservation,
  };

  return (
    <>
      <div className="hidden md:block">
        <DesktopReserveList {...commonProps} />
      </div>

      <div className="md:hidden">
        <MobileReserveList {...commonProps} />
      </div>
      <div className="md:hidden">
        <MobileCalendar groupedReservations={groupedReservations} />
      </div>
    </>
  );
};

interface ReserveListUIProps {
  groupedReservations: {
    date: string;
    label: string;
    reservations: ActiveReservations[];
  }[];
  pending: boolean;
  deletingReservationId: number | null;
  loading: boolean;
  error: unknown;
  cancelReservation: UseMutateAsyncFunction<
    CancelReservationByIdResponse,
    Error,
    number,
    unknown
  >;
  handleCancelReservation: (reservationId: number) => Promise<void>;
}

const DesktopReserveList = ({
  groupedReservations,
  pending,
  deletingReservationId,
  loading,
  handleCancelReservation,
}: ReserveListUIProps) => {
  return (
    <div className="fa flex  w-50 flex-col rounded-2xl border-2 border-gray-300 bg-res-orange p-4">
      <div className="bg-res-green-success rounded-2xl  p-1">
        <p className="text-center text-2xl text-white ">رزرو های من</p>
      </div>

      <div className="mt-7 flex flex-col gap-4">
        {loading && (
          <p className="text-center text-sm text-white">
            در حال بارگذاری...
          </p>
        )}

        {/* {error && (
          <p className="text-center text-sm text-red-500">
            خطا در دریافت اطلاعات
          </p>
        )} */}

        {!loading && groupedReservations.length === 0 && (
          <p className="text-center text-sm text-white">
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
                {group.reservations.map((reservation, index) => {
                  const isDeleting =
                    pending &&
                    deletingReservationId === reservation.reservation_id;

                  return (
                    <div
                      key={reservation.reservation_id}
                      className="mb-4 last:mb-0"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-semibold">رزرو {index + 1}</h4>

                        <button
                          type="button"
                          disabled={isDeleting}
                          onClick={() =>
                            handleCancelReservation(reservation.reservation_id)
                          }
                          className="rounded-md bg-red-500 px-2 py-1 text-xs text-white transition hover:bg-red-600 disabled:opacity-60"
                        >
                          {isDeleting ? "در حال حذف..." : "حذف"}
                        </button>
                      </div>

                      <p className="mt-2 text-sm text-gray-600">
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
                  );
                })}
              </div>
            }
            hoverPosition="right"
            hoverContentWrapperClassName="w-64"
            hoverContentClassName="bg-blue-100 border-blue-300"
            hoverTriggerClassName="text-nowrap bg-white"
          />
        ))}
      </div>
    </div>
  );
};

const MobileReserveList = ({
  groupedReservations,
  pending,
  deletingReservationId,
  loading,
  handleCancelReservation,
}: ReserveListUIProps) => {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="fa flex flex-col gap-3 rounded-2xl border-2 border-gray-300 bg-white p-4">
      <p className="text-center text-xl">رزرو های من</p>

      {loading && (
        <p className="text-center text-sm text-gray-500">در حال بارگذاری...</p>
      )}

      {/* {error && (
        <p className="text-center text-sm text-red-500">
          خطا در دریافت اطلاعات
        </p>
      )} */}

      {!loading && groupedReservations.length === 0 && (
        <p className="text-center text-sm text-gray-500">رزروی ثبت نشده است</p>
      )}

      {groupedReservations.map((group) => (
        <div key={group.date} className="rounded-xl border bg-gray-50 p-3">
          <button
            className="flex w-full items-center justify-between font-semibold"
            onClick={() => setOpen(open === group.date ? null : group.date)}
          >
            <span>{group.label}</span>
            <span>({group.reservations.length})</span>
          </button>

          {open === group.date && (
            <div className="mt-3 space-y-3">
              {group.reservations.map((reservation, index) => {
                const isDeleting =
                  pending &&
                  deletingReservationId === reservation.reservation_id;

                return (
                  <div
                    key={reservation.reservation_id}
                    className="rounded-lg border bg-white p-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">رزرو {index + 1}</span>

                      <button
                        disabled={isDeleting}
                        onClick={() =>
                          handleCancelReservation(reservation.reservation_id)
                        }
                        className="rounded-md bg-red-500 px-2 py-1 text-xs text-white disabled:opacity-60"
                      >
                        {isDeleting ? "در حال حذف..." : "حذف"}
                      </button>
                    </div>

                    <p className="mt-2 text-sm text-gray-600">
                      {formatTimeFa(reservation.start_time)} تا{" "}
                      {formatTimeFa(reservation.end_time)}
                    </p>

                    <p className="text-sm text-gray-600">
                      نوع: {reservation.reservation_type}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

interface MobileCalendarProps {
  groupedReservations: {
    date: string;
    label: string;
    reservations: ActiveReservations[];
  }[];
}

export const MobileCalendar = ({
  groupedReservations,
}: MobileCalendarProps) => {
  return (
    <div dir="rtl" className="flex flex-col gap-6 p-4 text-right">
      <h2 className="text-xl font-bold text-gray-800">تقویم رزروها</h2>

      {groupedReservations.length === 0 ? (
        <div className="flex h-40 items-center justify-center rounded-xl border-2 border-dashed border-gray-200 text-gray-400">
          رزروی برای نمایش وجود ندارد
        </div>
      ) : (
        <div className="relative border-r-2 border-blue-100 pr-6 mr-2">
          {groupedReservations.map((group) => (
            <div key={group.date} className="relative mb-8">
              {/* دایره تایم‌لاین سمت راست */}
              <div className="absolute -right-[33px] top-1 h-4 w-4 rounded-full border-2 border-blue-500 bg-white" />

              <h3 className="mb-4 font-semibold text-blue-900">
                {group.label}
              </h3>

              <div className="flex flex-col gap-3">
                {group.reservations.map((res) => (
                  <div
                    key={res.reservation_id}
                    className="flex flex-col rounded-xl border border-gray-100 bg-white p-3 shadow-sm transition hover:shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] text-blue-600">
                        {res.reservation_type}
                      </span>

                      <span className="text-sm font-medium text-gray-700">
                        {res.start_time.slice(0, 5)} -{" "}
                        {res.end_time.slice(0, 5)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReserveList;
