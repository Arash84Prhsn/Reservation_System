"use client";

import { GiOfficeChair } from "react-icons/gi";
// import { GrUserAdmin } from "react-icons/gr";

import { cn } from "@/utilities/cn";
import { SmallButtonCard } from "../../../components/common/small-cards/SmallButtonCard";
import { DesktopSeat } from "@/app/(admin)/page";

type SeatListParams = {
  seat: DesktopSeat | null;
  onChairSelect: (inputSeat: DesktopSeat) => void;
};

type SeatGroup = {
  title: string;
  type: DesktopSeat["type"] | "admin";
  prefix: "D" | "O" | "L" | "admin";
  colorClass: string;
  count: number;
  subtitle?: string;
  isAdmin?: boolean;
};

const chairGroups: SeatGroup[] = [
  {
    title: "مدیر",
    type: "admin",
    prefix: "admin",
    colorClass: "bg-res-red text-white",
    count: 1,
    // subtitle: "(ادمین)",
    isAdmin: true,
  },
  {
    title: "صندلی Dotin",
    type: "dotin",
    prefix: "D",
    colorClass: "bg-res-green-success",
    count: 4,
  },
  {
    title: "صندلی Optimization",
    type: "optimization",
    prefix: "O",
    colorClass: "bg-res-orange",
    count: 2,
  },
  {
    title: "صندلی Laptop",
    type: "laptop",
    prefix: "L",
    colorClass: "bg-res-gray-dark",
    count: 3,
  },
];

const SeatList = ({ seat, onChairSelect }: SeatListParams) => {
  return (
    // full calendar styles affect this comp. so if it resets the css styels (all: "revert") everything will be default.
    <div style={{ all: "revert" }}>
      <div className="h-[calc(100vh-130px)] flex w-50 flex-col rounded-2xl border-2 bg-res-green-100 border-gray-300 p-4">
        {/* <p className="text-center text-2xl ">صندلی / زمان</p> */}
        <p className="text-center text-xl">نوع صندلی</p>

        {chairGroups.map((group) => {
          const isSelectedGroup = seat?.type === group.type;

          return (
            <div key={group.type} className="mt-7">
              <p className="fa mb-2 flex gap-1 text-lg">
                {/* {group.isAdmin ? <GrUserAdmin className="text-lg" /> : null} */}
                {group.title}
              </p>

              <div className="flex flex-col gap-1 ">
                {Array.from({ length: group.count }, (_, index) => {
                  const chairNumber = index + 1;
                  const chairId = `${group.prefix}${chairNumber}`;
                  const isSelected =
                    isSelectedGroup && seat?.number === chairNumber;

                  const chairIcon = <GiOfficeChair size={30} />;

                  const baseCardClassName = cn(
                    group.colorClass,
                    isSelected
                      ? "border-2 border-red-500 ring-2 ring-red-300 rounded-2xl "
                      : "rounded-2xl h-[50px]",
                  );

                  return (
                    <SmallButtonCard
                      key={chairId}
                      title={chairId}
                      subTitle={group.isAdmin ? group.subtitle : undefined}
                      icon={chairIcon}
                      className={baseCardClassName}
                      onClick={() => {
                        if (!group.isAdmin) {
                          onChairSelect({
                            type: group.type as DesktopSeat["type"],
                            number: chairNumber,
                          });
                        }
                      }}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default SeatList;
