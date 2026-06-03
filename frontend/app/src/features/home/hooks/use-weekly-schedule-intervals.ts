import {
  ScheduleIntervalDay,
  SeatType,
  weekly_schedule_intervals,
} from "@/lib/api/services/reservation.service";
import { useEffect, useState } from "react";

interface UseWeeklyScheduleIntervalsParams {
  seatType?: SeatType;
  seatNumber?: number;
  date?: string;
}

export default function useWeeklyScheduleIntervals({
  seatType,
  seatNumber,
  date,
}: UseWeeklyScheduleIntervalsParams) {
  const [scheduleIntervals, setScheduleIntervals] = useState<
    ScheduleIntervalDay[]
  >([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchWeeklyScheduleIntervals() {
      setLoading(true);
      setError(null);

      if (!seatType || !seatNumber || !date) {
        setScheduleIntervals([]);
        setError(null);
        setLoading(false);
        return;
      }

      try {
        const response = await weekly_schedule_intervals({
          seat_type: seatType,
          seat_number: seatNumber,
          date,
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

    fetchWeeklyScheduleIntervals();

    return () => {
      cancelled = true;
    };
  }, [seatType, seatNumber, date]);

  return {
    scheduleIntervals,
    loading,
    error,
  };
}
