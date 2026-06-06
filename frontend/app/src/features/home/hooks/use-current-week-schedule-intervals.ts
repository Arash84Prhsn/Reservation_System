import {
  current_week_schedule_intervals,
  ScheduleIntervalDay,
  SeatType,
} from "@/lib/api/services/reservation.service";
import { useEffect, useState } from "react";

interface UseCurrentWeekScheduleIntervalsParams {
  seatType?: SeatType;
  seatNumber?: number;
}

export default function useCurrentWeekScheduleIntervals({
  seatType,
  seatNumber,
}: UseCurrentWeekScheduleIntervalsParams) {
  const [scheduleIntervals, setScheduleIntervals] = useState<
    ScheduleIntervalDay[]
  >([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchCurrentWeekScheduleIntervals() {
      setLoading(true);
      setError(null);

      if (!seatType || !seatNumber) {
        setScheduleIntervals([]);
        setError(null);
        setLoading(false);
        return;
      }

      try {
        const response = await current_week_schedule_intervals({
          seat_type: seatType,
          seat_number: seatNumber,
        });

        if (cancelled) return;

        if (response.success) {
          setScheduleIntervals(response.dates);
        } else {
          setScheduleIntervals([]);
        }
      } catch (error) {
        if (cancelled) return;

        console.error("Error fetching current week schedule intervals:", error);
        setError(error);
        setScheduleIntervals([]);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchCurrentWeekScheduleIntervals();

    return () => {
      cancelled = true;
    };
  }, [seatType, seatNumber]);

  return {
    scheduleIntervals,
    loading,
    error,
  };
}
