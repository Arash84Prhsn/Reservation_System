"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback, useMemo } from "react";
import { DateObject } from "react-multi-date-picker";

/**
 * Hook: useReservationParams
 *
 * Synchronizes selected date and seat state with the URL query parameters.
 * This ensures that on page reload, refresh, or link sharing, the user's
 * current day and seat selection are preserved.
 *
 * Parameters supported:
 * - date: YYYY-MM-DD (e.g. ?date=2026-08-20)
 * - seat: seat ID (e.g. ?seat=bottom-0)
 */
export function useReservationParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selectedDate = useMemo(() => {
    return searchParams.get("date") || new DateObject().format("YYYY-MM-DD");
  }, [searchParams]);

  const selectedSeatId = useMemo(() => {
    return searchParams.get("seat") || null;
  }, [searchParams]);

  const setReservationParams = useCallback(
    (params: { date?: string | null; seat?: string | null }) => {
      const nextParams = new URLSearchParams(searchParams.toString());

      if (params.date !== undefined) {
        if (params.date) {
          nextParams.set("date", params.date);
        } else {
          nextParams.delete("date");
        }
      }

      if (params.seat !== undefined) {
        if (params.seat) {
          nextParams.set("seat", params.seat);
        } else {
          nextParams.delete("seat");
        }
      }

      const queryString = nextParams.toString();
      const nextUrl = queryString ? `${pathname}?${queryString}` : pathname;
      router.replace(nextUrl, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  return {
    selectedDate,
    selectedSeatId,
    setReservationParams,
  };
}
