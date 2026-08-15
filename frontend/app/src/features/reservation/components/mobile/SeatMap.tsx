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
    <div className="mt-4 rounded-4xl h-115 flex justify-center items-center bg-res-green-100 border border-black p-4 shadow-lg">
      <p className="text-2xl  text-gray-700">ابتدا صندلی خود را انتخاب کنید</p>
    </div>
  );

  return (
    <div className="mx-auto w-full max-w-sm rounded-2xl  p-4" dir="rtl">
      <div className="relative w-full -mt-12" style={{ paddingBottom: "100%" }}>
        <div className="absolute inset-0 ">
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
