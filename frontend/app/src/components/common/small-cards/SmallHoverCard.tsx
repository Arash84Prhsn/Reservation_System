"use client";

import React, { useState, useRef } from "react";
import { SmallBaseCard } from "./SmallBaseCard";
import { cn } from "@/utilities/cn";

type HoverPosition = "top" | "bottom" | "left" | "right";

type SmallHoverCardProps = React.ComponentProps<typeof SmallBaseCard> & {
  hoverContent: React.ReactNode;
  hoverPosition?: HoverPosition;
  hoverTriggerClassName?: string;
  hoverContentWrapperClassName?: string;
  hoverContentClassName?: string;
};

export function SmallHoverCard({
  hoverContent,
  hoverPosition = "bottom",
  hoverTriggerClassName,
  hoverContentWrapperClassName,
  hoverContentClassName,
  ...baseProps
}: SmallHoverCardProps) {
  const [isHovering, setIsHovering] = useState(false);
  // استفاده از ref برای مدیریت تایمر
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "top-1/2 -translate-y-1/2 right-full mr-2",
    right: "top-1/2 -translate-y-1/2 left-full ml-2",
  };

  // مدیریت ورود موس
  const handleMouseEnter = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsHovering(true);
  };

  // مدیریت خروج موس با تاخیر
  const handleMouseLeave = () => {
    timerRef.current = setTimeout(() => {
      setIsHovering(false);
    }, 200); // 200 میلی‌ثانیه فرصت به کاربر برای حرکت موس به سمت content
  };

  return (
    <div
      className="group relative inline-block w-full"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <SmallBaseCard {...baseProps} className={cn(hoverTriggerClassName)} />

      {isHovering && (
        <div
          className={cn(
            `absolute z-50 w-max`, // w-max اضافه شد تا محتوا به هم نریزد
            positionClasses[hoverPosition],
            hoverContentWrapperClassName,
          )}
        >
          <div
            className={cn(
              `rounded-lg border border-gray-200 bg-white p-3 shadow-lg transition-opacity duration-200`,
              hoverContentClassName,
            )}
          >
            {hoverContent}
          </div>
        </div>
      )}
    </div>
  );
}
