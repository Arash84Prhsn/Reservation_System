/**
 * FinalReservationModal — Confirmation step before committing a reservation.
 *
 * Displays a sleek reservation ticket summary and conflict warnings.
 */

import { Modal } from "@/shared/components/ui/modal";
import {
  FinalReservationSubmissionInput,
  Warning,
} from "../../api";
import {
  formatPersianDate,
  formatPersianTime,
} from "@/features/reservation/utils/date";
import { toPersianDigits } from "@/shared/lib/utils";
import {
  getReservationTypeLabel,
  getSeatTypeLabel,
} from "@/features/reservation/config/reservation-options";
import { HiOutlineCalendar, HiOutlineClock } from "react-icons/hi";
import { GiOfficeChair } from "react-icons/gi";
import { BsCheckCircleFill, BsTag, BsExclamationTriangleFill } from "react-icons/bs";
import { Loader2 } from "lucide-react";

type FinalReservationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  pending?: boolean;
  reservationInfo: FinalReservationSubmissionInput | null;
  reservationWarning: Warning | null;
};

export function FinalReservationModal({
  isOpen,
  onClose,
  onConfirm,
  pending = false,
  reservationInfo,
  reservationWarning,
}: FinalReservationModalProps) {
  if (!reservationInfo) return null;

  const hasConflicts =
    reservationWarning?.needed &&
    reservationWarning?.conflict_intervals?.length > 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-[560px] overflow-visible rounded-3xl bg-white p-6 shadow-2xl backdrop-blur-md dark:bg-gray-900 lg:p-8"
    >
      <div className="relative flex flex-col text-right" dir="rtl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
              <BsCheckCircleFill size={22} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                تایید نهایی رزرو صندلی
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                لطفاً مشخصات رزرو خود را بررسی و تایید نمایید
              </p>
            </div>
          </div>
        </div>

        {/* Warning Alert */}
        {hasConflicts && (
          <div className="mt-4 rounded-2xl border border-amber-300 bg-amber-50/80 p-4 text-amber-900 shadow-xs dark:border-amber-700/50 dark:bg-amber-950/40 dark:text-amber-200">
            <div className="flex items-start gap-3">
              <BsExclamationTriangleFill className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" size={18} />
              <div className="flex-1 text-xs">
                <p className="font-bold">
                  {reservationWarning.warning_message || "هشدار: تداخل زمانی با سایر رزروها"}
                </p>
                {reservationWarning.conflict_intervals.length > 0 && (
                  <div className="mt-2.5 space-y-1">
                    <p className="font-semibold text-amber-800 dark:text-amber-300">
                      بازه‌های تداخلی:
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {reservationWarning.conflict_intervals.map((interval, idx) => (
                        <span
                          key={idx}
                          className="inline-flex rounded-md bg-amber-200/70 px-2 py-0.5 text-[11px] font-medium text-amber-950 dark:bg-amber-900/60 dark:text-amber-200"
                        >
                          {formatPersianTime(interval.start_time)} تا {formatPersianTime(interval.end_time)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Ticket Summary Card */}
        <div className="mt-5 rounded-2xl border border-gray-200 bg-gray-50/80 p-4.5 dark:border-gray-800 dark:bg-gray-800/40">
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <TicketItem
              icon={<HiOutlineCalendar className="text-blue-600 dark:text-blue-400" size={20} />}
              label="تاریخ رزرو"
              value={formatPersianDate(reservationInfo.reservation_date)}
            />

            <TicketItem
              icon={<HiOutlineClock className="text-emerald-600 dark:text-emerald-400" size={20} />}
              label="بازه زمانی"
              value={`${formatPersianTime(reservationInfo.start_time)} تا ${formatPersianTime(reservationInfo.end_time)}`}
            />

            <TicketItem
              icon={<GiOfficeChair className="text-indigo-600 dark:text-indigo-400" size={20} />}
              label="صندلی انتخابی"
              value={`صندلی ${getSeatTypeLabel(reservationInfo.seat_type)} ${toPersianDigits(String(reservationInfo.seat_number))}`}
            />

            <TicketItem
              icon={<BsTag className="text-amber-600 dark:text-amber-400" size={20} />}
              label="نوع رزرو"
              value={getReservationTypeLabel(reservationInfo.reservation_type)}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className="rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-100 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            انصراف
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={pending}
            className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:bg-emerald-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                <span>در حال ثبت...</span>
              </>
            ) : (
              <span>تایید و ثبت نهایی رزرو</span>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}

function TicketItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-gray-200/80 bg-white p-3 shadow-2xs dark:border-gray-700/60 dark:bg-gray-900/60">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-50 dark:bg-gray-800">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <span className="block text-[11px] font-medium text-gray-500 dark:text-gray-400">
          {label}
        </span>
        <span className="block truncate text-xs font-bold text-gray-800 dark:text-gray-100">
          {value || "—"}
        </span>
      </div>
    </div>
  );
}
