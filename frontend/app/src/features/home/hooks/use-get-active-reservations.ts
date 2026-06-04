import { useState, useCallback, useEffect, useRef } from "react";
import {
  get_user_active_reservations,
  ActiveReservations,
} from "@/lib/api/services/reservation.service";
import { toast } from "sonner";

export default function useActiveReservations() {
  const [activeReservations, setActiveReservations] = useState<
    ActiveReservations[]
  >([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<unknown | null>(null);

  const activeRequestRef = useRef<boolean>(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    activeRequestRef.current = true;

    try {
      const response = await get_user_active_reservations();

      if (!activeRequestRef.current) return;

      if (response.success) {
        setActiveReservations(response.reservations || []);
      } else {
        throw new Error(response.message || "خطا در دریافت اطلاعات");
      }
    } catch (err) {
      if (!activeRequestRef.current) return;
      setError(err);
      //   toast.error(err instanceof Error ? err.message : "خطای ناشناخته");
    } finally {
      if (activeRequestRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchData();
    return () => {
      activeRequestRef.current = false;
    };
  }, [fetchData]);

  return {
    activeReservations,
    loading,
    error,
    refetch: fetchData,
  };
}
