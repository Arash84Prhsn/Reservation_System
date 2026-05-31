// components/Seat.tsx

import React, { memo } from "react";
import { cx, getSeatRect, toPercentStyle } from "./SeatMap.utils";
import { STATUS_COLOR, STATUS_LABEL, type Seat } from "./SeatMap.config";

interface SeatProps {
  seat: Seat;
  total: number;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export const SeatComponent = memo(function SeatComponent({
  seat,
  total,
  isSelected,
  onSelect,
}: SeatProps) {
  const rect = getSeatRect(seat.side, seat.index, total);
  const style = toPercentStyle(rect);
  const isDisabled = seat.status === "reserved" || seat.status === "disabled";
  const effectiveStatus = isSelected ? "selected" : seat.status;

  return (
    <button
      style={{ position: "absolute", ...style }}
      className={cx(
        "flex items-center justify-center rounded-md text-xs font-bold text-white transition-all",
        STATUS_COLOR[effectiveStatus],
      )}
      disabled={isDisabled}
      onClick={() => !isDisabled && onSelect(seat.id)}
      aria-label={`صندلی ${seat.id} - ${STATUS_LABEL[effectiveStatus]}`}
      aria-pressed={isSelected}
    >
      {seat.index + 1}
    </button>
  );
});
