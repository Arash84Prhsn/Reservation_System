"use client";

import React from "react";
import { cn } from "@/utilities/cn";

type SmallBaseCardProps = {
  title: string;
  subTitle?: string;
  icon?: React.ReactNode;
  className?: string;
};

export function SmallBaseCard({
  title,
  subTitle,
  icon,
  className,
}: SmallBaseCardProps) {
  return (
    <div
      className={cn(
        "fa flex gap-1 rounded-2xl border-2 border-gray-300 p-3",
        className,
      )}
    >
      {icon && <div className="my-auto">{icon}</div>}
      <div className="flex flex-col gap-1">
        <p> {title}</p>
        {subTitle && <p>{subTitle}</p>}
      </div>
    </div>
  );
}
