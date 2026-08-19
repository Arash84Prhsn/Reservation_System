import React, { memo } from "react";
import { cx, getSeatRect, toPercentStyle } from "@/features/reservation/utils/SeatMap.utils";
import {
  STATUS_LABEL,
  type MobileSeat,
} from "@/features/reservation/config/SeatMap.config";
import { toPersianDigits } from "@/shared/lib/utils";
import { getSeatTypeLabel } from "@/features/reservation/config/reservation-options";

interface SeatProps {
  seat: MobileSeat;
  total: number;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

// Per-type initial character shown inside seat
const TYPE_INITIAL: Record<string, string> = {
  dotin: "D",
  optimization: "O",
  laptop: "L",
  manager: "M",
};

export const SeatComponent = memo(function SeatComponent({
  seat,
  total,
  isSelected,
  onSelect,
}: SeatProps) {
  const rect = getSeatRect(seat.side, seat.index, total);
  const style = toPercentStyle(rect);
  const isDisabled = seat.status === "disabled" || seat.type === "manager";

  // Left/right seats are rotated 90° by the layout — counter-rotate content so text reads top-to-bottom
  const isRotated = seat.side === "left" || seat.side === "right";

  const effectiveLabelStatus = isSelected ? "selected" : seat.status;
  const fullLabel = `${getSeatTypeLabel(seat.type)} ${toPersianDigits(seat.number)}`;

  return (
    <button
      style={{ position: "absolute", ...style }}
      className={cx(
        // Base layout
        "relative flex flex-col items-center justify-center rounded-xl font-bold",
        "transition-all duration-200 active:scale-90 overflow-hidden",
        // State styles
        isDisabled
          ? "bg-gray-100/80 border border-gray-200/60 text-gray-400 cursor-not-allowed opacity-60 shadow-none"
          : isSelected
            ? [
                "bg-blue-600 border-2 border-blue-500 text-white",
                "ring-2 ring-blue-400/60 ring-offset-1",
                "scale-110 shadow-lg shadow-blue-500/30 z-10",
              ].join(" ")
            : [
                "bg-white/95 border border-gray-200/80 text-gray-800",
                "hover:border-blue-400/70 hover:bg-blue-50/60 hover:shadow-md hover:scale-105",
                "shadow-sm backdrop-blur-sm",
              ].join(" "),
      )}
      disabled={isDisabled}
      onClick={() => !isDisabled && onSelect(seat.id)}
      aria-label={`صندلی ${fullLabel} - ${STATUS_LABEL[effectiveLabelStatus]}`}
      aria-pressed={isSelected}
      title={fullLabel}
    >
      {/* Counter-rotate content for left/right seats so text is always top-to-bottom */}
      <div
        className="flex flex-col items-center justify-center"
        style={isRotated ? { transform: "rotate(-90deg)" } : undefined}
      >
        {/* Type initial */}
        <span className={cx(
          "text-[11px] font-black leading-none tracking-tight",
          isSelected ? "text-white" : "text-gray-700",
        )}>
          {TYPE_INITIAL[seat.type] ?? seat.type[0].toUpperCase()}
        </span>
        {/* Number */}
        <span className={cx(
          "text-[9px] font-semibold leading-none mt-0.5",
          isSelected ? "text-blue-100" : "text-gray-500",
        )}>
          {toPersianDigits(seat.number)}
        </span>
      </div>

      {/* Selected glow */}
      {isSelected && (
        <span className="absolute -top-0.5 -left-0.5 h-2.5 w-2.5 rounded-full bg-blue-300/80 blur-sm" />
      )}
    </button>
  );
});
