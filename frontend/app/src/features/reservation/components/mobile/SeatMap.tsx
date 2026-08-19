// SeatMap.tsx

import React, { Dispatch, SetStateAction } from "react";
import { SeatComponent } from "./Seat";
import { useSeatMap } from "@/features/reservation/utils/SeatMap.utils";
import { type SeatMapConfig, type SeatData } from "@/features/reservation/config/SeatMap.config";
import { CalendarEvent } from "@/features/reservation/types";
import { Table } from "./Table";
import { SeatDetailPanel } from "./SeatDetailPanel";
import { useReservationParams } from "@/features/reservation/hooks/use-reservation-params";

interface SeatMapProps {
  config?: SeatMapConfig;
  data?: SeatData[];
  events?: CalendarEvent[];
  onAddEvent?: Dispatch<SetStateAction<CalendarEvent[]>>;
}

// ─── SeatMap (main) ──────────────────────────────────────
export default function SeatMap({ config, data }: SeatMapProps) {
  const { seats, config: mergedConfig } = useSeatMap({ config, data });
  const { selectedSeatId, selectedDate, setReservationParams } =
    useReservationParams();

  const countBySide = {
    top: mergedConfig.top,
    bottom: mergedConfig.bottom,
    left: mergedConfig.left,
    right: mergedConfig.right,
  };

  const selectedSeat = selectedSeatId
    ? seats.find((s) => s.id === selectedSeatId)
    : null;

  const handleSelectSeat = (id: string) => {
    setReservationParams({ seat: id });
  };

  const handleDeselectSeat = () => {
    setReservationParams({ seat: null });
  };

  const handleDateChange = (date: string) => {
    setReservationParams({ date });
  };

  const seatIsNotSelectedMessage = (
    <div className="mt-4 rounded-2xl flex flex-col justify-center items-center bg-white/80 border border-gray-200/60 shadow-sm p-8 gap-3 backdrop-blur-sm" dir="rtl">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-500 text-2xl">
        💺
      </div>
      <p className="text-base font-bold text-gray-700 text-center">
        صندلی مورد نظر را انتخاب کنید
      </p>
      <p className="text-xs text-gray-400 text-center leading-5">
        روی یکی از صندلی‌های نقشه کلیک کنید تا فرم رزرو باز شود
      </p>
    </div>
  );

  return (
    <div className="mx-auto w-full max-w-sm" dir="rtl">
      {/* ── Map Card ─────────────────────────────────── */}
      <div className="relative rounded-2xl overflow-hidden border border-gray-200/70 shadow-lg">
        {/* Room background: subtle dot grid */}
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: "#EBFFEE",
            backgroundSize: "20px 20px",
          }}
        />

        {/* Subtle vignette */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-slate-100/60 pointer-events-none" />

        {/* Map Canvas */}
        <div className="relative w-full -mt-12" style={{ paddingBottom: "100%" }}>
          <div className="absolute inset-0">
            <Table />
            {seats.map((seat) => (
              <SeatComponent
                key={seat.id}
                seat={seat}
                total={countBySide[seat.side]}
                isSelected={seat.id === selectedSeatId}
                onSelect={handleSelectSeat}
              />
            ))}
          </div>
        </div>

      </div>

      {/* ── Seat Detail / Empty Message ──────────────── */}
      {selectedSeat ? (
        <SeatDetailPanel
          seat={selectedSeat}
          status={selectedSeat.status}
          initialDate={selectedDate}
          onDateChange={handleDateChange}
          onDeselect={handleDeselectSeat}
        />
      ) : (
        seatIsNotSelectedMessage
      )}
    </div>
  );
}
