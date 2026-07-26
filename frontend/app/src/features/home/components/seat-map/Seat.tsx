import React, { memo } from "react";
import { cx, getSeatRect, toPercentStyle } from "./SeatMap.utils";
import {
  SeatColorTypes,
  STATUS_COLOR,
  STATUS_LABEL,
  type MobileSeat,
} from "./SeatMap.config";

interface SeatProps {
  seat: MobileSeat;
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
  // const isDisabled = seat.status === "reserved" || seat.status === "disabled";
  const isDisabled = seat.status === "disabled" || seat.type === "manager";
  const effectiveColorStatus: SeatColorTypes = isSelected
    ? "selected"
    : seat.type === "manager"
      ? "disabled"
      : seat.type; // manager seats are shown as disabled (not selectable) according to the requirements.

  const effectiveLabelStatus = isSelected ? "selected" : seat.status;

  const fullLabel = `${seat.type}${seat.number}`;
  return (
    <button
      style={{ position: "absolute", ...style }}
      className={cx(
        "flex items-center justify-center rounded-md  font-bold text-white transition-all",
        STATUS_COLOR[effectiveColorStatus],
      )}
      disabled={isDisabled}
      onClick={() => !isDisabled && onSelect(seat.id)}
      aria-label={`صندلی ${fullLabel} - ${STATUS_LABEL[effectiveLabelStatus]}`}
      aria-pressed={isSelected}
      title={fullLabel}
    >
      {seat.type[0].toUpperCase()} {seat.number}
    </button>
  );
});
