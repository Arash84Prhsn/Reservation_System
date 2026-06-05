// features/reservations/hooks/useActiveReservations.ts

import { useQuery } from "@tanstack/react-query";
import { get_user_active_reservations } from "@/lib/api/services/reservation.service";
import { reservationKeys } from "../queryKeys";

export function useActiveReservations() {
  const query = useQuery({
    queryKey: reservationKeys.active(),
    queryFn: get_user_active_reservations,
    select: (response) => response.reservations,
  });

  return {
    activeReservations: query.data ?? [],
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,

    // optional original query if you need advanced fields later
    query,
  };
}
