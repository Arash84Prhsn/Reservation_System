// don't use this component. you can use common/small-cards/base

"use client ";
import { cn } from "@/utilities/cn";
import React from "react";

type SmallCardProps = {
  title: string;
  subTitle?: string;
  icon?: React.ReactNode;
  className?: string;
  type?: "default" | "button";
  onClick?: () => void;
};

const SmallCard = ({
  title,
  subTitle,
  icon,
  className,
  type = "default",
  onClick,
}: SmallCardProps) => {
  const defaultCard = (
    <div
      className={cn(
        `fa flex gap-1 rounded-2xl border-2 border-gray-300 bg-gray-300 p-3`,
        className,
      )}
    >
      {icon && <div className="my-auto">{icon}</div>}
      <div className="flex flex-col gap-1">
        <p className="text-sm"> {title}</p>
        {subTitle && <p className="text-sm">{subTitle}</p>}
      </div>
    </div>
  );

  const cardButton = (
    <button
      className={cn(
        `fa flex gap-1 rounded-2xl border-2 border-gray-300 bg-gray-300 p-3 transition-transform duration-150 active:scale-105`,
        className,
      )}
      onClick={onClick}
    >
      {icon && <div className="my-auto">{icon}</div>}
      <div className="flex flex-col gap-1">
        <p className="text-sm"> {title}</p>
        {subTitle && <p className="text-sm">{subTitle}</p>}
      </div>
    </button>
  );

  if (type === "default") return defaultCard;
  else if (type === "button") return cardButton;
};

export default SmallCard;
