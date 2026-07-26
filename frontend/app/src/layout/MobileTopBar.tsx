import React from "react";
import Image from "next/image";
import UserDropdown from "@/features/header/components/UserDropdown";

const MobileTopBar = () => {
  return (
    <header className="fixed z-99 h-12 top-0 left-0 right-0 border-b border-gray-200 bg-res-green-900 md:hidden ">
      <div className="flex px-5  items-center justify-between h-full">
        <UserDropdown />
        <Image
          className="dark:hidden"
          src="/DOTIN/Logo/lab.png"
          alt="Logo"
          width={90}
          height={20}
        />
      </div>
    </header>
  );
};

export default MobileTopBar;
