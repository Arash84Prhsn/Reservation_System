"use client";

import { CalendarIcon, HomeIcon, UserIcon } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import React from "react";
import { BsQuestionCircle } from "react-icons/bs";
import { cn } from "@/shared/lib/utils";

const navItems = [
  {
    label: "راهنما",
    path: "/help",
    icon: BsQuestionCircle,
  },
  {
    label: "پروفایل",
    path: "/profile",
    icon: UserIcon,
  },
  {
    label: "رزروها",
    path: "/reserve-list",
    icon: CalendarIcon,
  },
  {
    label: "خانه",
    path: "/",
    icon: HomeIcon,
  },
];

const MobileBottomNavBar = () => {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <nav className="fixed z-99 bottom-0 left-0 right-0 border-t border-white/10 bg-res-green-900/95 shadow-lg backdrop-blur-md lg:hidden">
      <div className="flex h-14 items-center justify-around px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;

          return (
            <button
              key={item.path}
              type="button"
              onClick={() => router.push(item.path)}
              className={cn(
                "relative flex flex-col items-center justify-center gap-1 py-1 px-3 transition-all duration-150 active:scale-90",
                isActive
                  ? "text-amber-400 font-bold scale-105"
                  : "text-gray-300 hover:text-white",
              )}
            >
              <Icon className={cn("h-5 w-5 transition-transform", isActive && "scale-110")} />
              <span className="text-[11px] leading-tight">{item.label}</span>
              {isActive && (
                <span className="absolute -top-1 h-1 w-6 rounded-full bg-amber-400 shadow-xs" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNavBar;
