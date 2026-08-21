"use client";

import UserDropdown from "@/shared/layout/UserDropdown";
import { useSidebar } from "@/shared/context/SidebarContext";

const AppHeader = () => {
  const { toggleSidebar } = useSidebar();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-res-green-800 dark:bg-gray-900">
      <div
        className="flex w-full items-center justify-between px-6 py-3"
        dir="ltr"
      >
        <UserDropdown />

        <button
          type="button"
          onClick={toggleSidebar}
          aria-label="باز و بسته کردن منوی کناری"
          className="flex h-11 w-11 items-center justify-center rounded-lg border border-gray-200 bg-res-green-100 text-gray-600 transition hover:bg-white focus:outline-none focus:ring-4 focus:ring-white/15"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M5 7H19M5 12H19M5 17H19"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
    </header>
  );
};

export default AppHeader;
