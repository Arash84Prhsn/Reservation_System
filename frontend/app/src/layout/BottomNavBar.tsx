"use client";

import { CalendarIcon, HomeIcon, UserIcon } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import React from "react";

const navItems = [
  {
    label: "خانه",
    path: "/",
    icon: HomeIcon,
  },
  {
    label: "رزروها",
    path: "/reserve-list",
    icon: CalendarIcon,
  },
  {
    label: "پروفایل",
    path: "/profile",
    icon: UserIcon,
  },
];

const BottomNavBar = () => {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white md:hidden">
      <div className="flex h-16 items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;

          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`flex flex-col items-center ${
                isActive ? "text-blue-600" : "text-gray-500"
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

export default BottomNavBar;
