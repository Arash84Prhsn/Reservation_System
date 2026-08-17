export type SeatSide = "top" | "bottom" | "left" | "right";
export type SeatStatus = "available" | "selected" | "disabled";
export type SeatTypes = "dotin" | "optimization" | "laptop" | "manager";

export interface MobileSeat {
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
  right: 1,
};

export const STATUS_LABEL: Record<SeatStatus, string> = {
  available: "آزاد",
  selected: "انتخاب شده",
  disabled: "غیرفعال",
};

export const STATUS_COLOR: Record<SeatColorTypes, string> = {
  dotin: "bg-white text-gray-800 border-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50/50 cursor-pointer shadow-xs",
  optimization:
    "bg-white text-gray-800 border-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50/50 cursor-pointer shadow-xs",
  laptop: "bg-white text-gray-800 border-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50/50 cursor-pointer shadow-xs",
  manager: "bg-gray-200 text-gray-400 border-2 border-gray-300 cursor-not-allowed opacity-60",

  selected: "bg-blue-600 text-white border-2 border-blue-600 ring-2 ring-blue-400/50 cursor-pointer scale-105 shadow-md z-10",
  disabled: "bg-gray-200 text-gray-400 border-2 border-gray-300 cursor-not-allowed opacity-60",
};

export const LAYOUT: Record<SeatSide, SeatTypes[]> = {
  right: ["laptop"],
  bottom: ["dotin", "optimization", "optimization", "dotin"],
  left: ["laptop", "laptop"],
  top: ["dotin", "dotin", "manager"],
};
