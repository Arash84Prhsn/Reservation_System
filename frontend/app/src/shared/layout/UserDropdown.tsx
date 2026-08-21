"use client";

import Image from "next/image";
import { useState } from "react";
import { useAuth } from "@/shared/context/AuthContext";
import { useLogout } from "@/features/auth/hooks/use-logout";
import { Dropdown } from "../components/ui/dropdown/Dropdown";
import { DropdownItem } from "../components/ui/dropdown/DropdownItem";

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const { mutate: serverLogout, isPending } = useLogout();

  const closeDropdown = () => setIsOpen(false);

  return (
    <div className="relative" dir="rtl">
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className="dropdown-toggle flex items-center gap-2 rounded-2xl border border-gray-200/80 bg-white/90 px-2.5 py-1.5 text-gray-700 shadow-2xs backdrop-blur-sm transition-all hover:border-gray-300 hover:bg-white dark:border-gray-800 dark:bg-gray-900/90 dark:text-gray-200"
      >
        <span className="relative flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-emerald-100 ring-2 ring-emerald-200 dark:bg-emerald-950/60 dark:ring-emerald-800">
          <Image
            width={24}
            height={24}
            src="/images/user.png"
            alt="تصویر کاربر"
            className="object-cover"
          />
        </span>

        <span className="max-w-28 truncate text-xs font-semibold text-gray-800 dark:text-gray-200">
          {user?.username || "کاربر"}
        </span>

        <svg
          className={`stroke-gray-500 transition-transform duration-200 dark:stroke-gray-400 ${
            isOpen ? "rotate-180" : ""
          }`}
          width="16"
          height="16"
          viewBox="0 0 18 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M4.3125 8.65625L9 13.3437L13.6875 8.65625"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="left-0 z-50 mt-2 flex w-60 flex-col rounded-2xl border border-gray-200 bg-white/95 p-3 shadow-xl backdrop-blur-md dark:border-gray-800 dark:bg-gray-900/95"
      >
        <div className="min-w-0 border-b border-gray-100 pb-3 dark:border-gray-800">
          <span className="block truncate text-sm font-medium text-gray-700 dark:text-gray-300">
            {user?.username || "-"}
          </span>
          <span className="mt-0.5 block truncate text-xs text-gray-500 dark:text-gray-400">
            {user?.email || "-"}
          </span>
        </div>

        <ul className="fa flex flex-col gap-1 py-3">
          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              tag="a"
              href="/profile"
              className="flex items-center gap-3 rounded-lg px-3 py-2 font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5"
            >
              <svg
                className="h-5 w-5 fill-gray-500"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-5 0-9 2.5-9 5.5V22h18v-2.5C21 16.5 17 14 12 14Z" />
              </svg>
              پروفایل
            </DropdownItem>
          </li>
        </ul>

        <button
          type="button"
          disabled={isPending}
          onClick={() => {
            closeDropdown();
            serverLogout();
          }}
          className="fa flex w-full items-center gap-3 rounded-lg px-3 py-2 font-medium text-gray-700 transition hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-60 dark:text-gray-300 dark:hover:bg-red-950/30 dark:hover:text-red-300"
        >
          <svg
            className="h-5 w-5 fill-current"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path d="M10 17v-2h5V9h-5V7l-5 5 5 5Zm8-14h-8a2 2 0 0 0-2 2v2h2V5h8v14h-8v-2H8v2a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2Z" />
          </svg>
          {isPending ? "در حال خروج..." : "خروج"}
        </button>
      </Dropdown>
    </div>
  );
}
