import {
  final_reservation_submission,
  FinalReservationSubmissionInput,
} from "@/lib/api/services/reservation.service";
import { useState } from "react";
import { toast } from "sonner";

export function useFinalReservationSubmission() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submitFinalReservation(input: FinalReservationSubmissionInput) {
    setPending(true);
    setError(null);

    try {
      const res = await final_reservation_submission(input);

      toast.success(res.message || "رزرو با موفقیت انجام شد");

      return res;
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : typeof err === "string"
            ? err
            : "مشکلی پیش آمده است";

      setError(message);
      toast.error(message);

      return null;
    } finally {
      setPending(false);
    }
  }

  return {
    submitFinalReservation,
    pending,
    error,
  };
}