export type SeatSide = "top" | "bottom" | "left" | "right";
export type SeatStatus = "available" | "selected" | "disabled";
export type SeatTypes = "dotin" | "optimization" | "laptop" | "manager";

export interface Seat {
  id: string;
  side: SeatSide;
  index: number;
  status: SeatStatus;
  type: SeatTypes;
  number: number;
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

export type SeatColorTypes = SeatTypes | "selected" | "disabled";

// ─── Constants ───────────────────────────────────────────
export const BASE_W = 340;
export const BASE_H = 340;
export const SEAT_W = 44;
export const SEAT_H = 44;
export const TABLE_W = 220;
export const TABLE_H = 130;
export const SEAT_GAP = 8;

export const DEFAULT_SEAT_CONFIG: Required<SeatMapConfig> = {
  top: 3,
  bottom: 4,
  left: 2,
  right: 2,
};

export const STATUS_LABEL: Record<SeatStatus, string> = {
  available: "آزاد",
  selected: "انتخاب شده",
  disabled: "غیرفعال",
};

export const STATUS_COLOR: Record<SeatColorTypes, string> = {
  dotin: "bg-emerald-500 hover:bg-emerald-400 cursor-pointer",
  optimization: "bg-rose-500 cursor-not-allowed opacity-70",
  laptop: "bg-yellow-500 hover:bg-yellow-400 cursor-pointer",
  manager: "bg-purple-500 hover:bg-purple-400 cursor-pointer", // this color is not using because manager seat is not selectable according to the requirements.

  selected: "bg-blue-400 ring-2 ring-blue-300 cursor-pointer scale-110",
  disabled: "bg-gray-400 cursor-not-allowed opacity-50",
};

export const LAYOUT: Record<SeatSide, SeatTypes[]> = {
  right: ["laptop", "laptop"],
  bottom: ["dotin", "optimization", "optimization", "dotin"],
  left: ["laptop", "laptop"],
  top: ["dotin", "dotin", "manager"],
};
