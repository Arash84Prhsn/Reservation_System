// features/reservations/queryKeys.ts

import { SeatType } from "@/lib/api/services/reservation.service";

export const reservationKeys = {
  all: ["reservations"] as const,

  active: () => [...reservationKeys.all, "active"] as const,

  weeklyIntervals: (params: {
    seatType?: SeatType;
    seatNumber?: number;
    date?: string;
  }) =>
    [
      ...reservationKeys.all,
      "weekly-intervals",
      params.seatType,
      params.seatNumber,
      params.date,
    ] as const,
};
