"use client";
// TODO: correct the name
import Input from "@/shared/components/form/input/InputField";
import Label from "@/shared/components/form/Label";
import Button from "@/shared/components/ui/button/Button";
import { EyeCloseIcon, EyeIcon } from "@/shared/icons";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import ComponentCard from "@/shared/components/common/ComponentCard";
import { useLoginForm } from "../hooks/use-login-form";
import { useAuth } from "@/shared/context/AuthContext";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

const NewSignInForm = () => {
  const { user, isUserInitialized } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isUserInitialized && user) {
      router.replace("/");
    }
  }, [user, isUserInitialized, router]);
  const [showPassword, setShowPassword] = useState(false);
  const {
    username,
    password,
    // error,
    pending,
    onSubmit,
    setUsername,
    setPassword,
    // setError,
    // setPending,
  } = useLoginForm();

  const title = (
    <p className="text-title-sm sm:text-title-md mb-2 text-center text-gray-800 dark:text-white/90">
      ورود به سامانه
    </p>
  );
  return (
    <div className="flex h-screen items-center justify-center">
      <ComponentCard title={title} className="shadow-2xl min-w-96">
        <div className="flex w-full max-w-md flex-1 flex-col justify-center">
          <div>

              <form onSubmit={(e) => onSubmit(e)}>
                <div className="space-y-6">
                  <div>
                    <Label className="fa">
                      نام کاربری <span className="text-error-500">*</span>{" "}
                    </Label>
                    <Input
                      type="text"
                      id="fname"
                      name="fname"
                      className="fa"
                      defaultValue={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="fa">
                      رمز عبور <span className="text-error-500">*</span>{" "}
                    </Label>
                    <div className="relative">
                      <Input
                        placeholder="رمز عبور خود را وارد کنید"
                        type={showPassword ? "text" : "password"}
                        defaultValue={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <span
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute top-1/2 right-4 z-30 -translate-y-1/2 cursor-pointer"
                      >
                        {showPassword ? (
                          <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                        ) : (
                          <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">

                  </div>
                  <div>
                    <Button
                      className="w-full bg-emerald-600 hover:bg-emerald-700 rounded-xl"
                      size="sm"
                      disabled={pending}
                    >
                      {pending ? (
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="animate-spin" size={16} />
                          <span>در حال ورود...</span>
                        </div>
                      ) : (
                        <p className="font-bold">ورود به حساب کاربری</p>
                      )}
                    </Button>
                  </div>
                </div>
              </form>

              <div className="fa mt-5 text-center sm:text-start">
                <p className="font-normal text-xs text-gray-600 dark:text-gray-400">
                  حساب کاربری ندارید؟{" "}
                  <Link
                    href="/signup"
                    className="font-bold text-emerald-700 hover:text-emerald-800 dark:text-emerald-400"
                  >
                    ثبت نام کنید
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </ComponentCard>
      </div>
  );
};

export default NewSignInForm;
