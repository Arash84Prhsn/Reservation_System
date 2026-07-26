import { Modal } from "@/components/ui/modal";
import {
  FinalReservationSubmissionInput,
  Warning,
} from "@/lib/api/services/reservation.service";
import { dateStringToPersianDateObject } from "../HomeCalendar";

// FinalReservationModal
type FinalReservationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  pending?: boolean;
  reservationInfo: FinalReservationSubmissionInput | null;
  reservationWarning: Warning | null;
};

// Modal
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
      className="max-w-[660px] bg-res-green-100 overflow-visible p-6 lg:p-8"
    >
      <div className="relative flex flex-col overflow-visible px-1 text-right md:text-left">
        <div>
          <h5 className="mb-2 text-xl font-semibold text-gray-800 dark:text-white/90">
            تایید نهایی رزرو
          </h5>
        </div>

        {/* Warning Alert - if conflicts exist */}
        {hasConflicts && (
          <div className="fa mb-4 rounded-lg border border-yellow-300 bg-yellow-50 p-4 dark:bg-yellow-900/20">
            <div className="flex items-start gap-3">
              <div className="text-yellow-600 dark:text-yellow-500">⚠️</div>
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                  {reservationWarning.warning_message ||
                    "هشدار: تداخل زمانی وجود دارد"}
                </p>

                {reservationWarning.conflict_intervals.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-medium text-yellow-700 dark:text-yellow-400 mb-2">
                      بازه‌های زمانی تداخلی:
                    </p>
                    <div className="space-y-1.5">
                      {reservationWarning.conflict_intervals.map(
                        (interval, idx) => (
                          <div
                            key={idx}
                            className="text-xs bg-yellow-100 dark:bg-yellow-900/40 rounded px-2 py-1 text-yellow-800 dark:text-yellow-300"
                          >
                            {formatPersianTime(interval.start_time)} تا{" "}
                            {formatPersianTime(interval.end_time)}
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="fa mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-white/[0.03]">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InfoItem
              label="تاریخ رزرو"
              value={formatPersianDate(reservationInfo.reservation_date)}
            />

            <InfoItem
              label="نوع رزرو"
              value={getReservationTypeLabel(reservationInfo.reservation_type)}
            />

            <InfoItem
              label="زمان شروع"
              value={formatPersianTime(reservationInfo.start_time)}
            />

            <InfoItem
              label="زمان پایان"
              value={formatPersianTime(reservationInfo.end_time)}
            />

            <InfoItem
              label="نوع صندلی"
              value={getSeatTypeLabel(reservationInfo.seat_type)}
            />

            <InfoItem
              label="شماره صندلی"
              value={formatPersianNumber(String(reservationInfo.seat_number))}
            />
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.05]"
          >
            انصراف
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={pending}
            className="rounded-lg bg-res-green-success px-5 py-2.5 text-sm font-medium text-white transition hover:bg-res-green-success/80 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? "در حال ثبت..." : "تایید و ثبت رزرو"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">
        {label}
      </div>

      <div className="min-h-11 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90">
        {value || "—"}
      </div>
    </div>
  );
}

// helpers
function getReservationTypeLabel(type: string | null | undefined) {
  switch (type) {
    case "only running programs":
      return "محاسبات";
    case "dorsan desk":
      return "درسان دسک";
    case "internship":
      return "کارآموزی";
    case "project":
      return "پروژه";
    default:
      return "انتخاب نشده";
  }
}

function getSeatTypeLabel(type: string | null | undefined) {
  switch (type) {
    case "pc":
      return "کامپیوتر";
    case "laptop":
      return "لپ‌تاپ";
    default:
      return type || "نامشخص";
  }
}

const formatPersianNumber = (str: string): string => {
  const persianNumbers = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return str.replace(/\d/g, (digit) => persianNumbers[parseInt(digit)]);
};

const formatPersianTime = (timeString: string) => {
  // Remove seconds if present (keep only HH:MM)
  const timeWithoutSeconds = timeString.split(":").slice(0, 2).join(":");

  // Convert "HH:MM" string to Persian numbers
  const persianNumbers = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return timeWithoutSeconds.replace(
    /\d/g,
    (digit) => persianNumbers[parseInt(digit)],
  );
};

const formatPersianDate = (dateString: string) => {
  const persianDate = dateStringToPersianDateObject(dateString);
  return persianDate.format("YYYY/MM/DD");
};
