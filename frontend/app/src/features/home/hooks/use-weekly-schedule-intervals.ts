import { useQuery } from "@tanstack/react-query";
import {
  weekly_schedule_intervals,
  SeatType,
  WeeklyScheduleIntervalsResponse,
  ScheduleIntervalDay,
} from "@/lib/api/services/reservation.service";
import { reservationKeys } from "../queryKeys";

type UseWeeklyScheduleIntervalsParams = {
  seatType?: SeatType;
  seatNumber?: number;
  date?: string;
};

export function useWeeklyScheduleIntervals({
  seatType,
  seatNumber,
  date,
}: UseWeeklyScheduleIntervalsParams) {
  const enabled =
    seatType !== undefined && seatNumber !== undefined && date !== undefined;

  const query = useQuery<
    WeeklyScheduleIntervalsResponse,
    Error,
    ScheduleIntervalDay[]
  >({
    queryKey: reservationKeys.weeklyIntervals({
      seatType,
      seatNumber,
      date,
    }),

    enabled,

    queryFn: async () => {
      if (!seatType || seatNumber === undefined || !date) {
        throw new Error("Missing weekly schedule interval params");
      }

      return weekly_schedule_intervals({
        seat_type: seatType,
        seat_number: seatNumber,
        date,
      });
    },

    select: (response) => response.dates,
  });

  return {
    intervals: query.data ?? [],
    loading: query.isLoading,
    fetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
    query,
  };
}
