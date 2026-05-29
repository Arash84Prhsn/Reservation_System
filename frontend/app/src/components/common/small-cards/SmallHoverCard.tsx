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
  const triggerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "top-1/2 -translate-y-1/2 right-full mr-2",
    right: "top-1/2 -translate-y-1/2 left-full ml-2",
  };

  const animationClasses = {
    enter: "opacity-0 scale-95",
    enterActive: "opacity-100 scale-100 transition-all duration-300 ease-out",
    exit: "opacity-100 scale-100",
    exitActive: "opacity-0 scale-95 transition-all duration-200 ease-in",
  };

  return (
    <div
      className="group relative inline-block w-full"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      ref={triggerRef}
    >
      <SmallBaseCard {...baseProps} className={cn(hoverTriggerClassName)} />

      {isHovering && (
        <div
          ref={contentRef}
          className={cn(
            `absolute z-50`,
            positionClasses[hoverPosition],
            hoverContentWrapperClassName,
          )}
        >
          <div
            className={cn(
              `rounded-lg border border-gray-200 bg-white p-3 shadow-lg`,
              isHovering
                ? animationClasses.enterActive
                : animationClasses.exitActive,
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
