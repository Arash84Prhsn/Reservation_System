"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const guideSections = [
  {
    title: "نحوه رزرو صندلی",
    content: (
      <div className="space-y-3">
        <p>
          برای رزرو صندلی، ابتدا زمان مورد نظر خود را انتخاب کرده و سپس روی
          صندلی دلخواه کلیک کنید.
        </p>

        <div className="overflow-hidden rounded-lg border">
          <video controls className="w-full" src="/videos/how-to-reserve.mp4" />
        </div>
      </div>
    ),
  },

  {
    title: "قوانین رزرو",
    content: (
      <ul className="list-disc space-y-2 pr-5">
        <li>هر کاربر حداکثر ۲ رزرو در یک روز می‌تواند داشته باشد.</li>
        <li>رزروها نباید با یکدیگر همپوشانی داشته باشند.</li>
        <li>امکان رزرو دو صندلی متفاوت در یک روز وجود دارد.</li>
        <li>لغو رزرو روز جاری امکان‌پذیر نیست.</li>
        <li>لغو رزرو روزهای آینده مجاز است.</li>
        <li>
          فقط کاربران وابسته به داتین می‌توانند برای هفته آینده سیستم‌های داتین
          را رزرو کنند.
        </li>
      </ul>
    ),
  },

  {
    title: "نحوه مدیریت رزرو",
    content: (
      <div className="space-y-3">
        <p>
          از بخش «رزروهای من» می‌توانید رزروهای خود را مشاهده، ویرایش یا لغو
          کنید.
        </p>

        <div className="overflow-hidden rounded-lg border">
          <video
            controls
            className="w-full"
            src="/videos/manage-reservation.mp4"
          />
        </div>
      </div>
    ),
  },

  {
    title: "زمان‌های مجاز",
    content: (
      <ol className="list-decimal space-y-2 pr-5">
        <li>رزروها فقط بین ساعت ۸ صبح تا ۲ بعد از ظهر مجاز هستند.</li>
        <li>رزرو فقط در روزهای شنبه تا چهارشنبه امکان‌پذیر است.</li>
        <li>زمان شروع و پایان رزرو باید مضربی از ۱۵ دقیقه باشد.</li>
        <li>حداقل مدت رزرو ۱۵ دقیقه و حداکثر ۶ ساعت است.</li>
        <li>
          کاربران می‌توانند برای روزهای باقی‌مانده هفته جاری رزرو انجام دهند.
        </li>
        <li>از ساعت ۱۲ ظهر سه‌شنبه امکان رزرو برای هفته آینده فراهم می‌شود.</li>
      </ol>
    ),
  },

  {
    title: "انواع صندلی‌ها",
    content: (
      <div className="flex flex-col md:grid md:grid-cols-2  gap-4 overflow-x-auto pb-2">
        {[
          {
            title: "صندلی مدیر",
            count: "۱",
            image: "/seats/manager.jpg",
            desc: "امکان رزرو ندارد.",
          },
          {
            title: "صندلی داتین",
            count: "۴",
            image: "/seats/datin.jpg",
            desc: "کانفیگ سیستم داتین",
          },
          {
            title: "صندلی بهینه‌سازی",
            count: "۲",
            image: "/seats/optimization.jpg",
            desc: "کانفیگ سیستم بهینه‌سازی",
          },
          {
            title: "صندلی لپتاپ",
            count: "۳",
            image: "/seats/laptop.jpg",
            desc: "مناسب استفاده با لپتاپ شخصی",
          },
        ].map((seat) => (
          <div
            key={seat.title}
            className="min-w-[280px] rounded-xl border bg-white p-4"
          >
            {/* <Image
              src={seat.image}
              alt={seat.title}
              className="mb-3 h-40 w-full rounded-lg object-cover"
            /> */}

            <h4 className="font-bold">{seat.title}</h4>

            <p className="text-sm text-gray-500">تعداد: {seat.count}</p>

            <p className="mt-2 text-sm">{seat.desc}</p>
          </div>
        ))}
      </div>
    ),
  },

  {
    title: "موارد خاص",
    content: (
      <ul className="list-disc space-y-2 pr-5">
        <li>
          امکان رزرو یک کامپیوتر از طریق درسان دسک (صندلی آزاد) وجود دارد.
        </li>

        <li>در زمان جلسات، تمامی صندلی‌ها قفل شده و امکان رزرو وجود ندارد.</li>
      </ul>
    ),
  },
];

export default function ReservationGuide() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div dir="rtl" className="mx-auto max-w-4xl space-y-3">
      {guideSections.map((section, index) => (
        <div
          key={section.title}
          className="overflow-hidden rounded-xl border bg-white"
        >
          <button
            onClick={() => setOpen(open === index ? null : index)}
            className="flex w-full items-center justify-between p-4 text-right"
          >
            <span className="font-medium">{section.title}</span>

            <ChevronDown
              className={`h-5 w-5 transition ${
                open === index ? "rotate-180" : ""
              }`}
            />
          </button>

          {open === index && (
            <div className="border-t p-4">{section.content}</div>
          )}
        </div>
      ))}
    </div>
  );
}
