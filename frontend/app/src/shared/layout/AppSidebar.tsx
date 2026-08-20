"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { BsQuestionCircle } from "react-icons/bs";
import { GridIcon, UserCircleIcon } from "../icons";
import { useSidebar } from "../context/SidebarContext";

type NavItem = {
  name: string;
  icon: ReactNode;
  path: string;
};

const navItems: NavItem[] = [
  { icon: <GridIcon />, name: "خانه", path: "/" },
  { icon: <UserCircleIcon />, name: "پروفایل", path: "/profile" },
  {
    icon: <BsQuestionCircle className="h-5 w-5" />,
    name: "راهنما",
    path: "/help",
  },
];

const AppSidebar = () => {
  const { isExpanded, isMobileOpen } = useSidebar();
  const pathname = usePathname();
  const showLabels = isExpanded || isMobileOpen;

  return (
    <aside
      className={`fixed right-0 top-0 z-50 mt-16 flex h-screen flex-col border-l border-white/10 bg-res-green-900 px-5 text-gray-900 transition-all duration-300 ease-in-out lg:mt-0 ${
        showLabels ? "w-[290px]" : "w-[90px]"
      } ${isMobileOpen ? "translate-x-0" : "translate-x-full"} lg:translate-x-0`}
    >
      <div
        className={`flex min-h-28 items-center py-6 ${
          isExpanded ? "justify-center" : "lg:justify-center"
        }`}
      >
        {showLabels && (
          <Link href="/" aria-label="صفحه اصلی سامانه رزرو">
            <Image
              src="/DOTIN/Logo/lab.png"
              alt="آزمایشگاه فناوری‌های مالی"
              width={150}
              height={48}
              className="h-auto w-[150px]"
              priority
            />
          </Link>
        )}
      </div>

      <nav aria-label="منوی اصلی" className="no-scrollbar overflow-y-auto">
        <ul className="fa flex flex-col gap-4">
          {navItems.map((item) => {
            const isActive = pathname === item.path;

            return (
              <li key={item.path}>
                <Link
                  href={item.path}
                  aria-current={isActive ? "page" : undefined}
                  className={`menu-item group ${
                    isActive ? "menu-item-active" : "menu-item-inactive"
                  } ${!isExpanded ? "lg:justify-center" : "lg:justify-start"}`}
                >
                  <span
                    className={
                      isActive
                        ? "menu-item-icon-active"
                        : "menu-item-icon-inactive"
                    }
                  >
                    {item.icon}
                  </span>
                  {showLabels && (
                    <span className="menu-item-text">{item.name}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default AppSidebar;
