// components/SmallButtonCard.tsx
"use client";
import React from "react";
import { SmallBaseCard } from "./SmallBaseCard"; // ایمپورت کردن کامپوننت پایه
import { cn } from "@/lib/utils";

type SmallButtonCardProps = React.ComponentProps<typeof SmallBaseCard> & {
  onClick: () => void;
};

export function SmallButtonCard({
  onClick,
  className,
  ...baseProps
}: SmallButtonCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        `block w-full transition-transform duration-150 active:scale-105`,
        className,
      )}
    >
      <SmallBaseCard {...baseProps} className={className} />
    </button>
  );
}
