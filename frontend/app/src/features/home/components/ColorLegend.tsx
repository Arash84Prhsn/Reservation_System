"use client";

import React, { useState } from "react";
import { BsQuestionCircle } from "react-icons/bs";
// import { useSidebar } from "@/context/SidebarContext";

const LEGEND_ITEMS = [
  { colorClass: "bg-gray-500", label: "غیرقابل رزرو" },
  { colorClass: "bg-green-400", label: "در دسترس" },
  { colorClass: "bg-pink-500", label: "رزرو شده توسط دیگران" },
  { colorClass: "bg-blue-500", label: "رزرو شده توسط من" },
] as const;

export default function ColorLegend() {
  const [isMobileLegendOpen, setIsMobileLegendOpen] = useState(false);
  // const { isExpanded } = useSidebar();

  return (
    <div className="pointer-events-none fixed bottom-2 left-3 z-[60]">
      <div className="group flex items-center">
        <button
          type="button"
          onClick={() => setIsMobileLegendOpen(!isMobileLegendOpen)}
          className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-res-green-900/80 text-white shadow-lg backdrop-blur-md transition-all duration-200 hover:scale-110 active:scale-95"
        >
          <BsQuestionCircle size={50} />
        </button>

        <div
          className={`ml-3 w-56 rounded-2xl border border-white/10 bg-res-green-800/95 p-4 text-white shadow-2xl backdrop-blur-md transition-all duration-300 ${isMobileLegendOpen ? "pointer-events-auto scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0"} `}
        >
          <h3 className="mb-3 text-sm font-semibold text-gray-200">
            راهنمای رنگ
          </h3>
          <ul className="space-y-3">
            {LEGEND_ITEMS.map((item) => (
              <li key={item.label} className="flex items-center gap-3">
                <span
                  className={`h-3.5 w-3.5 rounded-full shadow-[0_0_0_2px_rgba(255,255,255,0.1)] ${item.colorClass}`}
                />
                <span className="text-sm text-gray-100">{item.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
