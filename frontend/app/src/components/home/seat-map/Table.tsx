import { BASE_H, BASE_W, TABLE_H, TABLE_W } from "./SeatMap.config";

export function Table() {
  return (
    <div
      style={{
        position: "absolute",
        left: `${((BASE_W - TABLE_W) / 2 / BASE_W) * 100}%`,
        top: `${((BASE_H - TABLE_H) / 2 / BASE_H) * 100}%`,
        width: `${(TABLE_W / BASE_W) * 100}%`,
        height: `${(TABLE_H / BASE_H) * 100}%`,
      }}
      className="flex items-center justify-center rounded-xl bg-slate-700 shadow-lg"
    >
      <span className="text-sm font-bold text-white">میز</span>
    </div>
  );
}
