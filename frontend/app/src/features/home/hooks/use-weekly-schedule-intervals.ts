import {
  ScheduleIntervalDay,
  SeatType,
  weekly_schedule_intervals,
} from "@/lib/api/services/reservation.service";
import { useCallback, useEffect, useRef, useState } from "react";

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

  const activeRequestRef = useRef<boolean>(true);

  const fetchWeeklyScheduleIntervals = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!seatType || !seatNumber || !date) {
      setScheduleIntervals([]);
      setError(null);
      setLoading(false);
      return;
    }
    // it's a new request
    activeRequestRef.current = true;

    try {
      const response = await weekly_schedule_intervals({
        seat_type: seatType,
        seat_number: seatNumber,
        date,
      });

      // if component is unmounted or new request is available, don't update.
      if (!activeRequestRef.current) return;

      if (response.success) {
        setScheduleIntervals(response.dates);
      } else {
        setScheduleIntervals([]);
      }
    } catch (error) {
      if (!activeRequestRef.current) return;

      console.error("Error fetching current week schedule intervals:", error);
      setError(error);
      setScheduleIntervals([]);
    } finally {
      if (!activeRequestRef.current) {
        setLoading(false);
      }
    }
  }, [seatType, seatNumber, date]);

  useEffect(() => {
    fetchWeeklyScheduleIntervals();

    // هنگام unmount یا تغییر پارامترها، درخواست‌های قبلی را غیرفعال می‌کنیم
    return () => {
      activeRequestRef.current = false;
    };
  }, [fetchWeeklyScheduleIntervals]);

  return {
    scheduleIntervals,
    loading,
    error,
    refetch: fetchWeeklyScheduleIntervals,
  };
}
