"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import ComponentCard from "@/shared/components/common/ComponentCard";
import Input from "@/shared/components/form/input/InputField";
import Label from "@/shared/components/form/Label";
import Button from "@/shared/components/ui/button/Button";
import { EyeCloseIcon, EyeIcon } from "@/shared/icons";
import { useAuth } from "@/shared/context/AuthContext";
import { useRouter } from "next/navigation";
import { useLoginForm } from "../hooks/use-login-form";

const NewSignInForm = () => {
  const { user, isUserInitialized } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const { username, password, pending, onSubmit, setUsername, setPassword } =
    useLoginForm();

  useEffect(() => {
    if (isUserInitialized && user) {
      router.replace("/");
    }
  }, [user, isUserInitialized, router]);

  const title = (
    <div className="text-center">
      <p className="mb-1 text-2xl font-bold text-gray-800 dark:text-white/90 sm:text-3xl">
        ورود به سامانه
      </p>
      <p className="text-xs font-normal text-gray-500 sm:text-sm">
        سامانه رزرو آزمایشگاه فناوری‌های مالی
      </p>
    </div>
  );

  return (
    <main
      dir="rtl"
      className="flex min-h-dvh items-center justify-center bg-res-green-100/60 p-4"
    >
      <div className="w-full max-w-md">
        <div className="mb-5 flex justify-center">
          <Image
            src="/DOTIN/Logo/lab.png"
            alt="آزمایشگاه فناوری‌های مالی"
            width={150}
            height={48}
            className="h-auto w-[150px]"
            priority
          />
        </div>

        <ComponentCard title={title} className="w-full shadow-2xl">
          <form onSubmit={onSubmit} className="space-y-6">
            <div>
              <Label className="fa" htmlFor="username">
                نام کاربری <span className="text-error-500">*</span>
              </Label>
              <Input
                type="text"
                id="username"
                name="username"
                className="fa"
                value={username}
                autoComplete="username"
                required
                onChange={(event) => setUsername(event.target.value)}
              />
            </div>

            <div>
              <Label className="fa" htmlFor="password">
                رمز عبور <span className="text-error-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  placeholder="رمز عبور خود را وارد کنید"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  autoComplete="current-password"
                  required
                  onChange={(event) => setPassword(event.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "مخفی کردن رمز عبور" : "نمایش رمز عبور"}
                  className="absolute left-3 top-1/2 z-30 -translate-y-1/2 rounded-md p-1 text-gray-500 transition hover:bg-gray-100"
                >
                  {showPassword ? (
                    <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                  ) : (
                    <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700"
              size="sm"
              disabled={pending}
            >
              {pending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>در حال ورود...</span>
                </>
              ) : (
                <span className="font-bold">ورود به حساب کاربری</span>
              )}
            </Button>
          </form>

          <div className="fa mt-5 text-center">
            <p className="text-xs font-normal text-gray-600 dark:text-gray-400">
              حساب کاربری ندارید؟{" "}
              <Link
                href="/signup"
                className="font-bold text-emerald-700 hover:text-emerald-800 dark:text-emerald-400"
              >
                ثبت نام کنید
              </Link>
            </p>
          </div>
        </ComponentCard>
      </div>
    </main>
  );
};

export default NewSignInForm;
