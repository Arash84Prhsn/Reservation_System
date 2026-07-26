"use client";

import React, { useState, useEffect } from "react";
import { BsQuestionCircle, BsChevronDown } from "react-icons/bs";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/context/SidebarContext";

// ============================================================
// LEGEND DATA
// ============================================================

const CALENDAR_LEGEND_ITEMS = [
  { colorClass: "bg-res-red", label: "جلسه آزمایشگاه" },
  { colorClass: "bg-white", label: "در دسترس" },
  { colorClass: "bg-res-orange", label: "رزرو شده توسط دیگران" },
  { colorClass: "bg-res-green-success", label: "رزرو شده توسط من" },
  { colorClass: "bg-gray-400", label: "رزرو system only" },
] as const;

// const SEAT_LEGEND_ITEMS = [
//   { colorClass: "bg-green-500", label: "صندلی آزاد" },
//   { colorClass: "bg-red-500", label: "صندلی اشغال شده" },
//   { colorClass: "bg-yellow-500", label: "صندلی در حال رزرو" },
// ] as const;

// ============================================================
// MAIN COLOR LEGEND COMPONENT
// ============================================================

type ColorLegendProps = {
  /**
   * If true, the guide will automatically expand on first visit
   */
  autoShow?: boolean;
  /**
   * Custom storage key for localStorage
   */
  storageKey?: string;
};

export default function ColorLegend({
  autoShow = true,
  storageKey = "hasSeenSeatGuide",
}: ColorLegendProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasBeenShown, setHasBeenShown] = useState(false);
  const router = useRouter();
  const { isMobile } = useSidebar();

  // Check if user has seen the guide before
  useEffect(() => {
    const hasSeenGuide = localStorage.getItem(storageKey);
    if (!hasSeenGuide && autoShow) {
      // Auto-expand on first visit
      const timer = setTimeout(() => {
        setIsExpanded(true);
        setHasBeenShown(true);
      }, 500);
      return () => clearTimeout(timer);
    } else if (hasSeenGuide) {
      setHasBeenShown(true);
    }
  }, [autoShow, storageKey]);

  const handleDontShowAgain = () => {
    localStorage.setItem(storageKey, "true");
    setIsExpanded(false);
  };

  const handleReadFullGuide = () => {
    router.push("/help");
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // Mobile: Bottom sheet that slides up
  if (isMobile) {
    return (
      <>
        {/* Backdrop */}
        {isExpanded && (
          <div
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
            onClick={() => setIsExpanded(false)}
          />
        )}

        {/* Bottom Sheet */}
        <div
          className={cn(
            "fixed inset-x-0 z-[70] mb-13 rounded-t-2xl bg-res-green-800/95 p-4 text-white shadow-2xl backdrop-blur-md transition-transform duration-300",
            isExpanded ? "bottom-0 translate-y-0" : "bottom-0 translate-y-full",
          )}
        >
          {/* Drag handle */}
          <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-white/30" />

          <div className="max-h-[60vh] overflow-y-auto">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-200">
                 راهنمای رنگ‌ها
              </h3>
            </div>

            <div className="space-y-6">
              {/* 1. Calendar Color Guide */}
              <div>
                <h4 className="mb-2 text-xs font-medium text-gray-300">
                  📅 تقویم
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {CALENDAR_LEGEND_ITEMS.map((item) => (
                    <div key={item.label} className="flex items-center gap-2">
                      <span
                        className={`h-3 w-3 rounded-full shadow-[0_0_0_2px_rgba(255,255,255,0.1)] ${item.colorClass}`}
                      />
                      <span className="text-xs text-gray-200">
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. Seat Color Guide */}
              {/* <div>
                <h4 className="mb-2 text-xs font-medium text-gray-300">
                  🪑 صندلی‌ها
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {SEAT_LEGEND_ITEMS.map((item) => (
                    <div key={item.label} className="flex items-center gap-2">
                      <span
                        className={`h-3 w-3 rounded-full shadow-[0_0_0_2px_rgba(255,255,255,0.1)] ${item.colorClass}`}
                      />
                      <span className="text-xs text-gray-200">
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div> */}

              {/* 3. Seat Map Image - Small version */}
              <div>
                <h4 className="mb-2 text-xs font-medium text-gray-300">
                  🗺️ موقعیت صندلی‌ها
                </h4>
                <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg border border-white/10 bg-white/5">
                  <div className="flex h-full flex-col items-center justify-center p-2 text-center text-gray-400">
                    <p className="text-2xl">🗺️</p>
                    <p className="text-[10px]">نقشه صندلی‌ها</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons - Reordered */}
              <div className="flex flex-col gap-2 pt-2">
                <button
                  onClick={handleReadFullGuide}
                  className="w-full rounded-lg bg-white/10 px-3 py-2.5 text-sm font-medium text-white transition hover:bg-white/20"
                >
                  📖 مطالعه راهنمای کامل
                </button>
                <button
                  onClick={handleDontShowAgain}
                  className="w-full rounded-lg border border-white/10 px-3 py-2 text-xs text-gray-300 transition hover:bg-white/5"
                >
                  ❌ دیگر نشان نده
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Button - Positioned above bottom nav */}
        <button
          type="button"
          onClick={toggleExpand}
          className={cn(
            "fixed z-[80] flex h-12 items-center justify-center rounded-full border border-white/20 bg-res-green-900/80 text-white shadow-lg backdrop-blur-md transition-all duration-200",
            "left-4", // Always on left side
            "bottom-20", // Above bottom nav (adjust based on your nav height)
            isExpanded ? "w-auto gap-2 px-4" : "w-12",
          )}
          style={{
            // If your bottom nav is higher, adjust this value
            bottom: "calc(env(safe-area-inset-bottom) + 80px)",
          }}
          aria-label={isExpanded ? "بستن راهنما" : "باز کردن راهنما"}
        >
          <BsQuestionCircle size={isExpanded ? 20 : 24} />
          {isExpanded && (
            <>
              <span className="text-sm font-medium">بستن راهنما</span>
              <BsChevronDown size={16} />
            </>
          )}
          {!isExpanded && hasBeenShown && (
            <span className="absolute -right-1 -top-1 h-2 w-2 animate-pulse rounded-full bg-red-400" />
          )}
        </button>
      </>
    );
  }

  // Desktop: Floating panel
  return (
    <div className="fixed bottom-4 left-4 z-[60]">
      {/* Legend Content */}
      <div
        className={cn(
          "mb-3 w-72 rounded-2xl border border-white/10 bg-res-green-800/95 p-4 text-white shadow-2xl backdrop-blur-md transition-all duration-300",
          isExpanded
            ? "pointer-events-auto max-h-[80vh] scale-100 opacity-100"
            : "pointer-events-none max-h-0 scale-95 overflow-hidden opacity-0",
        )}
      >
        <div className="max-h-[70vh] overflow-y-auto">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-200">
              🎯 راهنمای رنگ‌ها
            </h3>
          </div>

          <div className="space-y-6">
            {/* 1. Calendar Color Guide */}
            <div>
              <h4 className="mb-2 text-xs font-medium text-gray-300">
                📅 تقویم
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {CALENDAR_LEGEND_ITEMS.map((item) => (
                  <div key={item.label} className="flex items-center gap-2">
                    <span
                      className={`h-3 w-3 rounded-full shadow-[0_0_0_2px_rgba(255,255,255,0.1)] ${item.colorClass}`}
                    />
                    <span className="text-xs text-gray-200">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Seat Color Guide */}
            {/* <div>
              <h4 className="mb-2 text-xs font-medium text-gray-300">
                🪑 صندلی‌ها
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {SEAT_LEGEND_ITEMS.map((item) => (
                  <div key={item.label} className="flex items-center gap-2">
                    <span
                      className={`h-3 w-3 rounded-full shadow-[0_0_0_2px_rgba(255,255,255,0.1)] ${item.colorClass}`}
                    />
                    <span className="text-xs text-gray-200">{item.label}</span>
                  </div>
                ))}
              </div>
            </div> */}

            {/* 3. Seat Map Image - Small version */}
            <div>
              <h4 className="mb-2 text-xs font-medium text-gray-300">
                🗺️ موقعیت صندلی‌ها
              </h4>
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg border border-white/10 bg-white/5">
                <div className="flex h-full flex-col items-center justify-center p-2 text-center text-gray-400">
                  <p className="text-2xl">🗺️</p>
                  <p className="text-[10px]">نقشه صندلی‌ها</p>
                </div>
              </div>
            </div>

            {/* Action Buttons - Reordered */}
            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={handleReadFullGuide}
                className="w-full rounded-lg bg-white/10 px-3 py-2.5 text-sm font-medium text-white transition hover:bg-white/20"
              >
                📖 مطالعه راهنمای کامل
              </button>
              <button
                onClick={handleDontShowAgain}
                className="w-full rounded-lg border border-white/10 px-3 py-2 text-xs text-gray-300 transition hover:bg-white/5"
              >
                ❌ دیگر نشان نده
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Toggle Button */}
      <button
        type="button"
        onClick={toggleExpand}
        className={cn(
          "flex h-12 items-center justify-center rounded-full border border-white/20 bg-res-green-900/80 text-white shadow-lg backdrop-blur-md transition-all duration-200",
          isExpanded ? "w-auto gap-2 px-4" : "w-12",
        )}
        aria-label={isExpanded ? "بستن راهنما" : "باز کردن راهنما"}
      >
        <BsQuestionCircle size={isExpanded ? 20 : 24} />
        {isExpanded && (
          <>
            <span className="text-sm font-medium">بستن راهنما</span>
            <BsChevronDown size={16} />
          </>
        )}
        {!isExpanded && hasBeenShown && (
          <span className="absolute -right-1 -top-1 h-2 w-2 animate-pulse rounded-full bg-red-400" />
        )}
      </button>
    </div>
  );
}
