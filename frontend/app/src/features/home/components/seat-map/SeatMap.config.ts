export type SeatSide = "top" | "bottom" | "left" | "right";
export type SeatStatus = "available" | "reserved" | "selected" | "disabled";

export interface Seat {
  id: string;
  side: SeatSide;
  index: number;
  status: SeatStatus;
}

export interface SeatRect {
  x: number;
  y: number;
  w: number;
  h: number;
  rotate: number;
}

export interface SeatMapConfig {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
}

export interface SeatData {
  id: string;
  status: SeatStatus;
}

// ─── Constants ───────────────────────────────────────────
export const BASE_W = 340;
export const BASE_H = 340;
export const SEAT_W = 44;
export const SEAT_H = 44;
export const TABLE_W = 220;
export const TABLE_H = 130;
export const SEAT_GAP = 8;

export const DEFAULT_SEAT_CONFIG: Required<SeatMapConfig> = {
  top: 4,
  bottom: 4,
  left: 2,
  right: 2,
};

export const STATUS_LABEL: Record<SeatStatus, string> = {
  available: "آزاد",
  reserved: "رزرو شده",
  selected: "انتخاب شده",
  disabled: "غیرفعال",
};

export const STATUS_COLOR: Record<SeatStatus, string> = {
  available: "bg-emerald-500 hover:bg-emerald-400 cursor-pointer",
  reserved: "bg-rose-500 cursor-not-allowed opacity-70",
  selected: "bg-blue-500 ring-2 ring-blue-300 cursor-pointer",
  disabled: "bg-gray-400 cursor-not-allowed opacity-50",
};
