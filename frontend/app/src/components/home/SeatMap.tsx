"use client";

import { useMemo, useState, useRef } from "react";

type SeatSide = "top" | "bottom" | "left" | "right";
type SeatStatus = "free" | "reserved" | "occupied";

type Seat = {
  id: string;
  side: SeatSide;
  label: string;
  status: SeatStatus;
};

export default function SeatMap() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const infoRef = useRef<HTMLDivElement>(null);

  const seats = useMemo<Seat[]>(() => {
    const mk = (side: SeatSide, count: number) =>
      Array.from({ length: count }).map((_, i) => ({
        id: `${side}-${i + 1}`,
        side,
        label: `${side.toUpperCase()} ${i + 1}`,
        status: (i % 3 === 0
          ? "reserved"
          : i % 3 === 1
            ? "occupied"
            : "free") as SeatStatus,
      }));
    return [
      ...mk("top", 4),
      ...mk("bottom", 4),
      ...mk("left", 2),
      ...mk("right", 2),
    ];
  }, []);

  const selected = seats.find((s) => s.id === selectedId) || null;

  const handleSeatClick = (id: string) => {
    setSelectedId(id);
    // اسکرول به پنل اطلاعات در موبایل
    setTimeout(() => {
      infoRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 100);
  };

  return (
    <div className="flex flex-col justify-center gap-8 p-4 md:flex-row md:items-start">
      {/* MAP CONTAINER */}
      <div className="flex w-full justify-center md:w-auto">
        <div className="relative h-[420px] w-[480px] shrink-0 origin-top scale-[0.75] transition-transform md:scale-100">
          {/* TABLE */}
          <div className="absolute top-[130px] left-[110px] flex h-[160px] w-[260px] items-center justify-center rounded-2xl border-2 border-slate-300 bg-slate-100 font-bold text-slate-500 shadow-inner">
            TABLE
          </div>

          {/* SEATS */}
          {seats.map((s) => (
            <SeatButton
              key={s.id}
              seat={s}
              selected={s.id === selectedId}
              onClick={() => handleSeatClick(s.id)}
            />
          ))}
        </div>
      </div>

      {/* INFO PANEL */}
      <div
        ref={infoRef}
        className="w-full rounded-2xl border bg-white p-6 shadow-lg md:w-80"
      >
        <h2 className="mb-4 text-xl font-bold">جزئیات صندلی</h2>
        {!selected ? (
          <p className="text-slate-400">یک صندلی را انتخاب کنید...</p>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-slate-400">شناسه</label>
              <span className="font-semibold">{selected.id}</span>
            </div>
            <div>
              <label className="block text-xs text-slate-400">وضعیت</label>
              <span
                className={`rounded px-2 py-1 text-sm ${selected.status === "free" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}
              >
                {selected.status}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SeatButton({
  seat,
  selected,
  onClick,
}: {
  seat: Seat;
  selected: boolean;
  onClick: () => void;
}) {
  // محاسبات موقعیت برای چیدمان ۲ بالا/پایین و ۴ چپ/راست
  const pos =
    {
      "top-1": "left-[140px] top-[70px]",
      "top-2": "left-[290px] top-[70px]",
      "bottom-1": "left-[140px] bottom-[70px]",
      "bottom-2": "left-[290px] bottom-[70px]",
      "left-1": "left-[40px] top-[80px]",
      "left-2": "left-[40px] top-[160px]",
      "left-3": "left-[40px] top-[240px]",
      "left-4": "left-[40px] top-[320px]",
      "right-1": "right-[40px] top-[80px]",
      "right-2": "right-[40px] top-[160px]",
      "right-3": "right-[40px] top-[240px]",
      "right-4": "right-[40px] top-[320px]",
    }[seat.id] || "";

  const color =
    seat.status === "free"
      ? "bg-emerald-500"
      : seat.status === "reserved"
        ? "bg-amber-500"
        : "bg-rose-500";

  return (
    <button
      onClick={onClick}
      className={`absolute h-12 w-12 rounded-full font-bold text-white transition-all ${color} ${pos} ${selected ? "scale-110 ring-4 ring-slate-900" : "hover:scale-105"}`}
    >
      {seat.id.split("-")[1]}
    </button>
  );
}
