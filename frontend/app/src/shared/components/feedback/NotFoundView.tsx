import Link from "next/link";
import { ArrowRight, Home } from "lucide-react";

export default function NotFoundView() {
  return (
    <main
      dir="rtl"
      className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-res-green-900 px-4 py-10"
    >
      <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-res-orange/20 blur-3xl" />
      <div className="absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-res-green-success/20 blur-3xl" />

      <section className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-white/15 bg-white p-6 text-center shadow-2xl sm:p-10">


        <h1 className="text-7xl font-black tracking-tight text-res-green-900 sm:text-8xl">
          ۴۰۴
        </h1>
        <h2 className="mt-5 text-xl font-bold text-gray-900 sm:text-2xl">
          صفحه مورد نظر پیدا نشد
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-gray-500 sm:text-base">
          آدرسی که وارد کرده‌اید وجود ندارد یا ممکن است جابه‌جا شده باشد. از
          دکمه زیر به صفحه اصلی سامانه رزرو برگردید.
        </p>

        <div className="mt-8 flex flex-col-reverse justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-res-green-success px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-res-green-success/90 focus:outline-none focus:ring-4 focus:ring-res-green-success/20"
          >
            <Home className="h-4 w-4" />
            بازگشت به خانه
          </Link>
          <Link
            href="/help"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-200/60"
          >
            راهنمای سامانه
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
