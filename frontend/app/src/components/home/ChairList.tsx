"use client";

import { GiOfficeChair } from "react-icons/gi";
import { GrUserAdmin } from "react-icons/gr";
import { ChairState } from "@/app/type";

import { cn } from "@/utilities/cn";
import { SmallButtonCard } from "../common/small-cards/SmallButtonCard";

type ChairListParams = {
  chair: ChairState | null;
  onChairSelect: (
    chairType: ChairState["chairType"],
    chairNumber: number,
  ) => void;
};

type ChairGroup = {
  title: string;
  prefix: ChairState["chairType"] | "admin";
  colorClass: string;
  count: number;
  subtitle?: string;
  isAdmin?: boolean;
};

const chairGroups: ChairGroup[] = [
  {
    title: "مدیر",
    prefix: "admin",
    colorClass: "bg-gray-200",
    count: 1,
    // subtitle: "(ادمین)",
    isAdmin: true,
  },
  {
    title: "صندلی های A",
    prefix: "A",
    colorClass: "bg-sky-200",
    count: 4,
  },
  {
    title: "صندلی های B",
    prefix: "B",
    colorClass: "bg-purple-200",
    count: 2,
  },
  {
    title: "صندلی های C",
    prefix: "C",
    colorClass: "bg-green-200",
    count: 3,
  },
];

const ChairList = ({ chair, onChairSelect }: ChairListParams) => {
  return (
    <div className="flex h-full w-50 flex-col rounded-2xl border-2 border-gray-300 bg-white p-4">
      <p className="text-center text-2xl">صندلی / زمان</p>
      <p className="text-center text-lg">نوع صندلی</p>

      {chairGroups.map((group) => {
        const isSelectedGroup = chair?.chairType === group.prefix;

        return (
          <div key={group.prefix} className="mt-7">
            <p className="fa mb-2 flex gap-1 text-lg">
              {group.isAdmin ? <GrUserAdmin className="text-lg" /> : null}
              {group.title}
            </p>

            <div className="flex flex-col gap-1">
              {Array.from({ length: group.count }, (_, index) => {
                const chairNumber = index + 1;
                const chairId = `${group.prefix}${chairNumber}`;
                const isSelected =
                  isSelectedGroup && chair?.chairNumber === chairNumber;

                const chairIcon = <GiOfficeChair size={30} />;

                const baseCardClassName = cn(
                  group.colorClass,
                  isSelected
                    ? "border-2 border-red-500 ring-2 ring-red-300 rounded-2xl "
                    : "rounded-2xl ",
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
                        onChairSelect(
                          group.prefix as ChairState["chairType"],
                          chairNumber,
                        );
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
  );
};
export default ChairList;
