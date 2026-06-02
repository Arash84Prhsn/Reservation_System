import {
  ScheduleDay,
  SeatType,
  weekly_schedule_timeslots,
} from "@/lib/api/services/reservation.service";
import { useEffect, useState } from "react";

export function useWeeklyScheduleTimeslots(
  params: { date: string; seatType: SeatType; seatNumber: number },
  options?: { enabled?: boolean },
) {
  const { date, seatType, seatNumber } = params;
  const enabled = options?.enabled ?? true;

  const [schedule, setSchedule] = useState<ScheduleDay[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || !date || !seatType || !seatNumber) {
      setSchedule([]);
      return;
    }

    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await weekly_schedule_timeslots({
          date,
          seat_type: seatType,
          seat_number: seatNumber,
        });

        if (!cancelled) {
          setSchedule(res.schedule ?? []);
        }
      } catch (e) {
        if (!cancelled) {
          setSchedule([]);
          setError(e instanceof Error ? e.message : "Failed to load schedule");
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
  }, [date, seatType, seatNumber, enabled]);

  return { schedule, loading, error };
}
