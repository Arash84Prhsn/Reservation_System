// SeatMap.tsx

import React, { Dispatch, SetStateAction } from "react";
import { SeatComponent } from "./Seat";
import { useSeatMap, useSelectedSeat } from "./SeatMap.utils";
import { type SeatMapConfig, type SeatData } from "./SeatMap.config";
import { CalendarEvent, ChairState } from "@/app/type";
import { Table } from "./Table";
import { SeatDetailPanel } from "./SeatDetailPanel";

interface SeatMapProps {
  config?: SeatMapConfig;
  data?: SeatData[];
  chair?: ChairState;
  events?: CalendarEvent[];
  onAddEvent?: Dispatch<SetStateAction<CalendarEvent[]>>;
}

// ─── SeatMap (main) ──────────────────────────────────────
export default function SeatMap({
  config,
  data,
  chair,
}: SeatMapProps) {
  const { seats, config: mergedConfig } = useSeatMap({ config, data });
  const { selectedId, select, deselect, isSelected } = useSelectedSeat();

  const countBySide = {
    top: mergedConfig.top,
    bottom: mergedConfig.bottom,
    left: mergedConfig.left,
    right: mergedConfig.right,
  };

  const selectedSeat = selectedId
    ? seats.find((s) => s.id === selectedId)
    : null;

  return (
    <div
      className="mx-auto w-full max-w-sm rounded-2xl bg-amber-600/50 p-4"
      dir="rtl"
    >
      <div className="relative w-full" style={{ paddingBottom: "100%" }}>
        <div className="absolute inset-0">
          <Table />
          {seats.map((seat) => (
            <SeatComponent
              key={seat.id}
              // selectable={Number(seat.id) === 0}
              seat={seat}
              total={countBySide[seat.side]}
              isSelected={isSelected(seat.id)}
              onSelect={select}
            />
          ))}
        </div>
      </div>

      {selectedSeat && (
        <SeatDetailPanel
          seat={selectedSeat}
          status={selectedSeat.status}
          onDeselect={deselect}
          // chair={chair}
        />
      )}
    </div>
  );
}
