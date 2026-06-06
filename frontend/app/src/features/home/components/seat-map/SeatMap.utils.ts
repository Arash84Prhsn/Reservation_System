import {
  BASE_W,
  BASE_H,
  SEAT_W,
  SEAT_H,
  TABLE_W,
  TABLE_H,
  SEAT_GAP,
  type MobileSeat,
  type SeatRect,
  type SeatSide,
  type SeatMapConfig,
  type SeatData,
  type SeatStatus,
  // DEFAULT_SEAT_CONFIG,
  SeatTypes,
  LAYOUT,
} from "./SeatMap.config";
import { useState, useMemo, useCallback } from "react";

// ─── Utils ───────────────────────────────────────────────

export function cx(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

/** توزیع یکنواخت n موقعیت در بازه [min, max] */
function spread(count: number, min: number, max: number): number[] {
  if (count <= 0) return [];
  if (count === 1) return [(min + max) / 2];
  const step = (max - min) / (count - 1);
  return Array.from({ length: count }, (_, i) => min + i * step);
}

export function getSeatRect(
  side: SeatSide,
  index: number,
  total: number,
): SeatRect {
  const tableX = (BASE_W - TABLE_W) / 2;
  const tableY = (BASE_H - TABLE_H) / 2;

  const isHorizontal = side === "top" || side === "bottom";
  const rotate = isHorizontal ? 0 : 90;

  if (isHorizontal) {
    let positions = spread(total, tableX, tableX + TABLE_W - SEAT_W);
    // make bottom render right -> left
    if (side === "bottom") positions = positions.slice().reverse();
    const x = positions[index];
    const y =
      side === "top" ? tableY - SEAT_H - SEAT_GAP : tableY + TABLE_H + SEAT_GAP;
    return { x, y, w: SEAT_W, h: SEAT_H, rotate };
  } else {
    let positions = spread(total, tableY, tableY + TABLE_H - SEAT_H);
    // make left render bottom -> up
    if (side === "left") positions = positions.slice().reverse();
    const y = positions[index];
    const x =
      side === "left"
        ? tableX - SEAT_W - SEAT_GAP
        : tableX + TABLE_W + SEAT_GAP;
    return { x, y, w: SEAT_W, h: SEAT_H, rotate };
  }
}

export function toPercentStyle(rect: SeatRect): React.CSSProperties {
  return {
    left: `${(rect.x / BASE_W) * 100}%`,
    top: `${(rect.y / BASE_H) * 100}%`,
    width: `${(rect.w / BASE_W) * 100}%`,
    height: `${(rect.h / BASE_H) * 100}%`,
    transform: rect.rotate ? `rotate(${rect.rotate}deg)` : undefined,
  };
}

export function makeSeat(
  side: SeatSide,
  index: number,
  status: SeatStatus = "available",
  type: SeatTypes,
  number: number,
): MobileSeat {
  // //added 1 disabled seat for demo:
  // if (side === "bottom" && index === 0) {
  //   status = "disabled";
  // }

  return { id: `${side}-${index}`, side, index, status, type, number };
}

// ─── useSelectedSeat ─────────────────────────────────────

interface UseSelectedSeat {
  selectedId: string | null;
  select: (id: string) => void;
  deselect: () => void;
  isSelected: (id: string) => boolean;
}

export function useSelectedSeat(): UseSelectedSeat {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const select = useCallback((id: string) => setSelectedId(id), []);
  const deselect = useCallback(() => setSelectedId(null), []);
  const isSelected = useCallback(
    (id: string) => selectedId === id,
    [selectedId],
  );

  return { selectedId, select, deselect, isSelected };
}

// ─── useSeatMap ──────────────────────────────────────────

interface UseSeatMapProps {
  config?: SeatMapConfig;
  data?: SeatData[];
}

export function useSeatMap({ data }: UseSeatMapProps) {
  const seats = useMemo<MobileSeat[]>(() => {
    const counters: Record<SeatTypes, number> = {
      dotin: 0,
      optimization: 0,
      laptop: 0,
      manager: 0,
    };

    const sides: SeatSide[] = ["right", "bottom", "left", "top"];

    return sides.flatMap((side) => {
      const typesForSide = LAYOUT[side];

      return typesForSide.map((type, index) => {
        counters[type] += 1;
        const number = counters[type];
        const id = `${side}-${index}`;
        const fromData = data?.find((d) => d.id === id);

        // If no backend status, keep your demo behavior:
        // const status: SeatStatus =
        //   fromData?.status ?? (index % 3 === 0 ? "reserved" : "available");
        const status = fromData?.status ?? "available";

        return makeSeat(side, index, status, type, number);
      });
    });
  }, [data]);

  // counts per side for getSeatRect(total)
  const mergedConfig = useMemo(() => {
    return {
      top: LAYOUT.top.length,
      bottom: LAYOUT.bottom.length,
      left: LAYOUT.left.length,
      right: LAYOUT.right.length,
    };
  }, []);

  return { seats, config: mergedConfig };
}

// export function useSeatMap({ config = {}, data }: UseSeatMapProps) {
//   const mergedConfig = { ...DEFAULT_SEAT_CONFIG, ...config };

//   const seats = useMemo<Seat[]>(() => {
//     const sides: SeatSide[] = ["top", "bottom", "left", "right"];
//     return sides.flatMap((side) => {
//       const count = mergedConfig[side];
//       return Array.from({ length: count }, (_, i) => {
//         const id = `${side}-${i}`;
//         const fromData = data?.find((d) => d.id === id);
//         // mock status اگه data نداشتیم
//         const status: SeatStatus =
//           fromData?.status ?? (i % 3 === 0 ? "reserved" : "available");
//         return makeSeat(side, i, status, type);
//       });
//     });
//   }, [mergedConfig, data]);

//   return { seats, config: mergedConfig };
// }
