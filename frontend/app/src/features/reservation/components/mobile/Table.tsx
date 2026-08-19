import { BASE_H, BASE_W, TABLE_H, TABLE_W } from "@/features/reservation/config/SeatMap.config";

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
      className="flex flex-col items-center justify-center rounded-2xl overflow-hidden relative"
    >
      {/* Glassmorphism table surface */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-slate-200/90 via-slate-100/95 to-white/90 backdrop-blur-sm border border-white/60 shadow-xl" />

      {/* Subtle horizontal grain lines */}
      <div
        className="absolute inset-0 rounded-2xl overflow-hidden opacity-[0.07]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 8px, rgba(100,90,70,1) 8px, rgba(100,90,70,1) 9px)",
        }}
      />

      {/* Inner shadow ring */}
      <div className="absolute inset-1 rounded-xl border border-slate-300/40 shadow-inner" />

      {/* Center label */}
      <div className="relative z-10 flex flex-col items-center gap-0.5">
        <span className="text-[10px] font-bold text-slate-500/80 tracking-widest uppercase select-none">
          میز آزمایشگاه
        </span>
        <div className="h-px w-8 bg-slate-400/40 rounded" />
      </div>
    </div>
  );
}
