import React from "react";
import Image from "next/image";

const MobileTopBar = () => {
  return (
    <header className="fixed h-12 top-0 left-0 right-0 border-b border-gray-200 bg-res-green-900 md:hidden ">
      <div className="flex  items-center justify-center h-full">
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
