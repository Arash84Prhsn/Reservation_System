import {
  open_dates_for_user,
  SeatType,
} from "@/lib/api/services/reservation.service";
import {  useEffect, useState } from "react";

export default function useOpenDatesForUser(seatType: SeatType) {
  const [openDates, setOpenDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await open_dates_for_user(seatType);

        if (!cancelled) {
          setOpenDates(res.dates ?? []);
        }
      } catch (e) {
        if (!cancelled) {
          setOpenDates([]);
          setError(
            e instanceof Error ? e.message : "Failed to load open dates",
          );
          throw e;
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [seatType]);

  return { openDates, loading, error };
}
