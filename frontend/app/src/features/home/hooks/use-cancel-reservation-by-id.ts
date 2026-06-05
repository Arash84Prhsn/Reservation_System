import {
  cancel_reservation_by_id,
  CancelReservationByIdResponse,
} from "@/lib/api/services/reservation.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { reservationKeys } from "../queryKeys";

export function useCancelReservationById() {
  const queryClient = useQueryClient();

  const mutation = useMutation<CancelReservationByIdResponse, Error, number>({
    mutationFn: async (reservationId: number) => {
      return cancel_reservation_by_id(reservationId);
    },

    onSuccess: async (response) => {
      toast.success(response.message || "رزرو با موفقیت حذف شد");

      // update all reservation-related queries
      await queryClient.invalidateQueries({
        queryKey: reservationKeys.all,
      });
    },

    onError: (error) => {
      console.error("Cancel reservation failed:", error);
    },
  });

  return {
    cancelReservation: mutation.mutateAsync,
    pending: mutation.isPending,
    error: mutation.error,
    mutation,
  };
}
