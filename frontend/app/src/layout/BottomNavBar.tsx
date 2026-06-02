import { CalendarIcon, HomeIcon, UserIcon } from "lucide-react";
import React from "react";

const BottomNavBar = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden">
      <div className="flex justify-around items-center h-16">
        <button className="flex flex-col items-center text-blue-600">
          <HomeIcon className="w-6 h-6" />
          <span className="text-xs">خانه</span>
        </button>
        <button className="flex flex-col items-center text-gray-500">
          <CalendarIcon className="w-6 h-6" />
          <span className="text-xs">رزروها</span>
        </button>
        <button className="flex flex-col items-center text-gray-500">
          <UserIcon className="w-6 h-6" />
          <span className="text-xs">پروفایل</span>
        </button>
      </div>
    </nav>
  );
};

export default BottomNavBar;
