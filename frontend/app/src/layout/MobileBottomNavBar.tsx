"use client";

import { CalendarIcon, HomeIcon, UserIcon } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import React from "react";
import { BsQuestionCircle } from "react-icons/bs";

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
    <nav className="fixed z-99 bottom-0 left-0 right-0 border-t border-gray-200 bg-res-green-900 md:hidden">
      <div className="flex h-[54px] items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;

          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`flex flex-col items-center ${
                isActive ? "text-res-orange" : "text-gray-200"
              }`}
            >
              <Icon className="h-6 w-6" />
              <span className="text-xs">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNavBar;
