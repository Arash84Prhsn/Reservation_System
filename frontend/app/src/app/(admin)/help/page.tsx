"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

type GuideSection = {
  title: string;
  content: ReactNode;
};

const guideSections: GuideSection[] = [
  {
    title: "نحوه رزرو صندلی",
    content: (
      <ol className="list-decimal space-y-2 pr-5">
        <li>از صفحه اصلی، صندلی مورد نظر خود را انتخاب کنید.</li>
        <li>تاریخ، نوع رزرو و بازه زمانی آزاد را مشخص کنید.</li>
        <li>روی «ثبت رزرو» بزنید تا اطلاعات توسط سرور بررسی شود.</li>
        <li>خلاصه رزرو و هشدارهای احتمالی را در پنجره تأیید نهایی بررسی کنید.</li>
        <li>با تأیید نهایی، رزرو ثبت و تقویم به‌روزرسانی می‌شود.</li>
      </ol>
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
          دسترسی به برخی سیستم‌ها و بازه‌های زمانی ممکن است بر اساس وضعیت
          همکاری کاربر محدود باشد.
        </li>
      </ul>
    ),
  },
  {
    title: "نحوه مدیریت رزرو",
    content: (
      <div className="space-y-3">
        <p>
          از بخش «رزروهای من» می‌توانید رزروهای فعال خود را مشاهده کنید. در
          صورت مجاز بودن لغو، گزینه حذف برای رزرو نمایش داده می‌شود.
        </p>
        <p className="rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-sm text-emerald-900">
          پس از ثبت یا لغو رزرو، اطلاعات تقویم و فهرست رزروها به صورت خودکار
          دوباره از سرور دریافت می‌شود.
        </p>
      </div>
    ),
  },
  {
    title: "زمان‌های مجاز",
    content: (
      <ol className="list-decimal space-y-2 pr-5">
        <li>رزروها فقط بین ساعت ۸ صبح تا ۲ بعد از ظهر مجاز هستند.</li>
        <li>رزرو فقط در روزهای کاری تعریف‌شده توسط آزمایشگاه انجام می‌شود.</li>
        <li>زمان شروع و پایان رزرو باید با اسلات‌های زمانی سامانه هماهنگ باشد.</li>
        <li>حداقل و حداکثر مدت رزرو توسط قوانین سمت سرور کنترل می‌شود.</li>
        <li>
          روزهای قابل رزرو برای هر نوع صندلی از سرور دریافت و در رابط کاربری
          نمایش داده می‌شوند.
        </li>
      </ol>
    ),
  },
  {
    title: "انواع صندلی‌ها",
    content: (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {[
          {
            title: "صندلی مدیر",
            count: "۱",
            desc: "برای کاربران عادی قابل رزرو نیست.",
          },
          {
            title: "صندلی داتین",
            count: "۴",
            desc: "دارای سیستم با پیکربندی داتین.",
          },
          {
            title: "صندلی بهینه‌سازی",
            count: "۲",
            desc: "دارای سیستم با پیکربندی بهینه‌سازی.",
          },
          {
            title: "صندلی لپ‌تاپ",
            count: "۳",
            desc: "مناسب استفاده با لپ‌تاپ شخصی.",
          },
        ].map((seat) => (
          <div
            key={seat.title}
            className="rounded-xl border border-gray-200 bg-white p-4"
          >
            <h4 className="font-bold">{seat.title}</h4>
            <p className="mt-1 text-sm text-gray-500">تعداد: {seat.count}</p>
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
          برخی رزروهای سیستمی ممکن است استفاده از سیستم را محدود کنند، در حالی
          که صندلی فیزیکی همچنان قابل استفاده باشد. سامانه در این حالت هشدار
          مناسب نمایش می‌دهد.
        </li>
        <li>
          در زمان رویدادها یا جلسات آزمایشگاه، بازه مربوطه در تقویم غیرفعال
          می‌شود و امکان رزرو آن وجود ندارد.
        </li>
      </ul>
    ),
  },
];

export default function ReservationGuide() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div dir="rtl" className="mx-auto max-w-4xl space-y-3 p-2">
      {guideSections.map((section, index) => {
        const isOpen = open === index;
        const panelId = `guide-panel-${index}`;

        return (
          <section
            key={section.title}
            className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg"
          >
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : index)}
              aria-expanded={isOpen}
              aria-controls={panelId}
              className="flex w-full items-center justify-between bg-res-orange/85 p-4 text-right text-gray-900 transition hover:bg-res-orange"
            >
              <span className="font-bold">{section.title}</span>
              <ChevronDown
                className={`h-5 w-5 transition ${isOpen ? "rotate-180" : ""}`}
                aria-hidden="true"
              />
            </button>

            {isOpen && (
              <div
                id={panelId}
                className="border-t border-gray-100 p-4 text-base leading-8 text-gray-800 sm:text-lg"
              >
                {section.content}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
