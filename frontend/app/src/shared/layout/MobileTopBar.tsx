import Image from "next/image";
import UserDropdown from "@/shared/layout/UserDropdown";

const MobileTopBar = () => {
  return (
    <header className="fixed left-0 right-0 top-0 z-99 h-12 border-b border-white/10 bg-res-green-900 lg:hidden">
      <div className="flex h-full items-center justify-between px-5" dir="ltr">
        <UserDropdown />
        <Image
          src="/DOTIN/Logo/lab.png"
          alt="آزمایشگاه فناوری‌های مالی"
          width={90}
          height={28}
          className="h-auto w-[90px]"
          priority
        />
      </div>
    </header>
  );
};

export default MobileTopBar;
