import { open_dates_for_user, type SeatType } from "../api";
import { useEffect, useState } from "react";

export default function useOpenDatesForUser(seatType: SeatType) {
  const [openDates, setOpenDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadOpenDates = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await open_dates_for_user(seatType);
        if (!cancelled) {
          setOpenDates(response.dates ?? []);
        }
      } catch (err) {
        if (!cancelled) {
          setOpenDates([]);
          setError(
            err instanceof Error
              ? err.message
              : "خطا در دریافت روزهای قابل رزرو",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadOpenDates();

    return () => {
      cancelled = true;
    };
  }, [seatType]);

  return { openDates, loading, error };
}
