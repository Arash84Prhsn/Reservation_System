import { Modal } from "@/components/ui/modal";
import { FinalReservationSubmissionInput } from "@/lib/api/services/reservation.service";

// FinalReservationModal
type FinalReservationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  pending?: boolean;
  data: FinalReservationSubmissionInput | null;
};

// Modal
export function FinalReservationModal({
  isOpen,
  onClose,
  onConfirm,
  pending = false,
  data,
}: FinalReservationModalProps) {
  if (!data) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-[560px] overflow-visible p-6 lg:p-8"
    >
      <div className="fa relative flex flex-col overflow-visible px-1 text-right">
        <div>
          <h5 className="mb-2 text-xl font-semibold text-gray-800 dark:text-white/90">
            تایید نهایی رزرو
          </h5>

          <p className="text-sm leading-6 text-gray-500 dark:text-gray-400">
            لطفاً اطلاعات رزرو را بررسی کنید. پس از تایید، رزرو شما ثبت نهایی
            خواهد شد.
          </p>
        </div>

        <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-white/[0.03]">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InfoItem label="تاریخ رزرو" value={data.reservation_date} />

            <InfoItem
              label="نوع رزرو"
              value={getReservationTypeLabel(data.reservation_type)}
            />

            <InfoItem label="زمان شروع" value={data.start_time} />

            <InfoItem label="زمان پایان" value={data.end_time} />

            <InfoItem
              label="نوع صندلی"
              value={getSeatTypeLabel(data.seat_type)}
            />

            <InfoItem label="شماره صندلی" value={String(data.seat_number)} />
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
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
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
