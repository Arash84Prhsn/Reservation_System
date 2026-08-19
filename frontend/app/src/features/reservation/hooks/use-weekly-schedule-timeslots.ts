import { useQuery } from "@tanstack/react-query";
import {
  SeatType,
  weekly_schedule_timeslots,
} from "../api";
import { reservationKeys } from "@/features/reservation/queryKeys";

export function useWeeklyScheduleTimeslots(
  params: { date: string; seatType: SeatType; seatNumber: number },
  options?: { enabled?: boolean },
) {
  const { date, seatType, seatNumber } = params;
  const enabled = options?.enabled ?? true;

  const query = useQuery({
    queryKey: [...reservationKeys.all, "timeslots", date, seatType, seatNumber],
    enabled: !!(enabled && date && seatType && seatNumber),
    queryFn: async () => {
      if (!date || !seatType || !seatNumber) {
        throw new Error("Missing required parameters for weekly timeslots");
      }

      return weekly_schedule_timeslots({
        date,
        seat_type: seatType,
        seat_number: seatNumber,
      });
    },
    select: (data) => data.schedule ?? [],
  });

  return {
    schedule: query.data ?? [],
    loading: query.isLoading,
    error: query.error?.message ?? null
  };
}
