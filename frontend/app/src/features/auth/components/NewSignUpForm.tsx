"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import ComponentCard from "@/shared/components/common/ComponentCard";
import Input from "@/shared/components/form/input/InputField";
import Label from "@/shared/components/form/Label";
import Select from "@/shared/components/form/Select";
import CustomPhoneInput from "@/shared/components/form/group-input/CustomPhoneInput";
import { EyeCloseIcon, EyeIcon } from "@/shared/icons";
import { useAuth } from "@/shared/context/AuthContext";
import { useRouter } from "next/navigation";
import {
  AssociationStatus,
  ASSOCIATION_STATUS_LABELS,
} from "../api";
import { useRegisterForm } from "../hooks/use-register-form";

const NewSignUpForm = () => {
  const { user, isUserInitialized } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const {
    username,
    association,
    phone,
    email,
    password,
    pending,
    onSubmit,
    setAssociation,
    setEmail,
    setPassword,
    setPhone,
    setUsername,
  } = useRegisterForm();

  useEffect(() => {
    if (isUserInitialized && user) {
      router.replace("/");
    }
  }, [user, isUserInitialized, router]);

  const options = useMemo(
    () =>
      Object.values(AssociationStatus)
        .filter((value) => value !== AssociationStatus.None)
        .map((value) => ({
          value,
          label: ASSOCIATION_STATUS_LABELS[value],
        })),
    [],
  );

  const title = (
    <div className="text-center">
      <p className="mb-1 text-2xl font-bold text-gray-800 dark:text-white/90 sm:text-3xl">
        ثبت نام در سامانه
      </p>
      <p className="text-xs font-normal text-gray-500 sm:text-sm">
        اطلاعات حساب کاربری خود را وارد کنید
      </p>
    </div>
  );

  return (
    <main
      dir="rtl"
      className="flex min-h-dvh items-center justify-center bg-res-green-100/60 p-4 py-8"
    >
      <div className="w-full max-w-xl">
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
          <form onSubmit={onSubmit} className="space-y-5">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <Label className="fa">نوع همکاری / دانشگاهی *</Label>
                <Select
                  options={options}
                  value={
                    association === AssociationStatus.None ? "" : association
                  }
                  placeholder="انتخاب کنید"
                  className="relative text-black"
                  onChange={(value) =>
                    setAssociation(value as AssociationStatus)
                  }
                />
              </div>

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
            </div>

            <div>
              <Label className="fa" htmlFor="phone">
                تلفن <span className="text-error-500">*</span>
              </Label>
              <CustomPhoneInput
                id="phone"
                name="phone"
                value={phone}
                required
                onChange={(event) => setPhone(event.target.value)}
              />
            </div>

            <div>
              <Label className="fa" htmlFor="email">
                ایمیل <span className="text-error-500">*</span>
              </Label>
              <Input
                type="email"
                id="email"
                name="email"
                placeholder="ایمیل خود را وارد کنید"
                value={email}
                autoComplete="email"
                required
                onChange={(event) => setEmail(event.target.value)}
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
                  autoComplete="new-password"
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

            <button
              type="submit"
              disabled={pending}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-emerald-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>در حال ثبت نام...</span>
                </>
              ) : (
                <span>ثبت نام در سامانه</span>
              )}
            </button>
          </form>

          <div className="fa mt-5 text-center">
            <p className="text-xs font-normal text-gray-600 dark:text-gray-400">
              قبلاً ثبت نام کرده‌اید؟{" "}
              <Link
                href="/signin"
                className="font-bold text-emerald-700 hover:text-emerald-800 dark:text-emerald-400"
              >
                وارد شوید
              </Link>
            </p>
          </div>
        </ComponentCard>
      </div>
    </main>
  );
};

export default NewSignUpForm;
