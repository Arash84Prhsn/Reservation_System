"use client";
import React, { useEffect, useState } from "react";
import { useModal } from "../../../shared/hooks/useModal";
import { Modal } from "../../../shared/components/ui/modal";
import Button from "../../../shared/components/ui/button/Button";
import Input from "../../../shared/components/form/input/InputField";
import Label from "../../../shared/components/form/Label";
import Image from "next/image";
import { useUserProfile } from "../hooks/use-user-profile";
import { useUpdateEmail } from "../hooks/use-update-email";
import { useUpdatePhone } from "../hooks/use-update-phone";
import { useUpdateUsername } from "../hooks/use-update-username";
import { Loader2 } from "lucide-react";
import CustomPhoneInput from "@/shared/components/form/group-input/CustomPhoneInput";
import { getAssociationStatusLabel } from "@/features/auth/api";
import { toPersianDigits } from "@/shared/lib/utils";
import { useAuth } from "@/shared/context/AuthContext";

interface FormData {
  username: string;
  email: string;
  phone: string;
  association: string;
}

export default function UserProfile() {
  const [formData, setFormData] = useState<FormData>({
    username: "",
    email: "",
    phone: "",
    association: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const { login: updateLocalUser } = useAuth();

  const { isOpen, openModal, closeModal } = useModal();

  const { data: user, isLoading, error } = useUserProfile();

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        email: user.email || "",
        phone: user.phone || "",
        association: getAssociationStatusLabel(user.association || ""),
      });
    }
  }, [user]);

  const updateEmailMutation = useUpdateEmail();
  const updatePhoneMutation = useUpdatePhone();
  const updateUsernameMutation = useUpdateUsername();

  const handleInputChange =
    (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const promises = [];
      if (user && formData.email !== user.email) {
        promises.push(updateEmailMutation.mutateAsync(formData.email));
      }
      if (user && formData.phone !== user.phone) {
        promises.push(updatePhoneMutation.mutateAsync(formData.phone));
      }
      if (user && formData.username !== user.username) {
        promises.push(updateUsernameMutation.mutateAsync(formData.username));
      }
      await Promise.all(promises);

      if (user) {
        updateLocalUser({
          ...user,
          username: formData.username,
          email: formData.email,
          phone: formData.phone,
        });
      }

      closeModal();
    } catch {
      // Individual mutations display their own user-facing error messages.
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6 fa">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6 fa">
        <div className="text-center text-red-500">
          خطا در بارگذاری اطلاعات کاربر
        </div>
      </div>
    );
  }

  return (
    <div className="fa max-w-4xl mx-auto">
      <div className="p-6 border border-gray-200 rounded-3xl bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900 lg:p-8">
        <div className="flex flex-col gap-5 pb-6 mb-6 border-b border-gray-100 dark:border-gray-800 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col items-center w-full gap-5 xl:flex-row">
            <div className="w-20 h-20 flex justify-center items-center overflow-hidden border-2 border-emerald-100 rounded-full dark:border-emerald-900/60 bg-emerald-50 shadow-xs">
              <Image
                width={56}
                height={56}
                src="/images/user.png"
                alt="کاربر"
                className="object-cover"
              />
            </div>
            <div className="order-3 xl:order-2 text-center xl:text-right">
              <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                {user?.username || "-"}
              </h4>
              <div className="mt-1 flex items-center justify-center xl:justify-start gap-2">
                <span className="rounded-full bg-emerald-50 border border-emerald-200 px-3 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300">
                  {getAssociationStatusLabel(user?.association)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* اطلاعات شخصی */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex-1">
            <h4 className="mb-6 text-base font-bold text-gray-800 dark:text-white/90">
              اطلاعات حساب کاربری
            </h4>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:gap-7">
              <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4 dark:border-gray-800 dark:bg-gray-800/40">
                <p className="mb-1 text-xs font-medium text-gray-400 dark:text-gray-500">
                  نام کاربری
                </p>
                <p className="text-sm font-bold text-gray-800 dark:text-white">
                  {user?.username || "-"}
                </p>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4 dark:border-gray-800 dark:bg-gray-800/40">
                <p className="mb-1 text-xs font-medium text-gray-400 dark:text-gray-500">
                  آدرس ایمیل
                </p>
                <p className="text-sm font-bold text-gray-800 dark:text-white">
                  {user?.email || "-"}
                </p>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4 dark:border-gray-800 dark:bg-gray-800/40">
                <p className="mb-1 text-xs font-medium text-gray-400 dark:text-gray-500">
                  شماره تماس
                </p>
                <p className="text-sm font-bold text-gray-800 dark:text-white">
                  {user?.phone ? toPersianDigits(user.phone) : "-"}
                </p>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4 dark:border-gray-800 dark:bg-gray-800/40">
                <p className="mb-1 text-xs font-medium text-gray-400 dark:text-gray-500">
                  وضعیت همکاری / دانشگاهی
                </p>
                <p className="text-sm font-bold text-gray-800 dark:text-white">
                  {getAssociationStatusLabel(user?.association)}
                </p>
              </div>
            </div>
          </div>

          {/* دکمه ویرایش */}
          <button
            onClick={openModal}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-res-green-900 px-5 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-res-green-900/90 active:scale-[0.98] lg:w-auto"
          >
            <span>ویرایش مشخصات</span>
            <svg
              className="fill-current"
              width="16"
              height="16"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
                fill=""
              />
            </svg>
          </button>
        </div>
      </div>

      {/* مودال ویرایش */}
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-6 dark:bg-gray-900 lg:p-8" dir="rtl">
          <div className="text-right border-b border-gray-100 pb-3 pr-12 sm:pr-16 dark:border-gray-800">
            <h4 className="text-xl font-bold text-gray-900 dark:text-white">
              ویرایش اطلاعات حساب کاربری
            </h4>
          </div>
          <form className="flex flex-col" onSubmit={(e) => e.preventDefault()}>
            <div className="custom-scrollbar overflow-y-auto pt-4 pb-3">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div className="col-span-2 lg:col-span-1 text-right">
                  <Label>نام کاربری</Label>
                  <Input
                    type="text"
                    value={formData.username}
                    onChange={handleInputChange("username")}
                  />
                </div>

                <div className="col-span-2 lg:col-span-1 text-right">
                  <Label>تلفن</Label>
                  <CustomPhoneInput
                    value={formData.phone}
                    onChange={handleInputChange("phone")}
                  />
                </div>

                <div className="col-span-2 text-right">
                  <Label>آدرس ایمیل</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange("email")}
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100 dark:border-gray-800">
              <Button size="sm" variant="outline" onClick={closeModal} className="rounded-xl">
                انصراف
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                className="bg-emerald-600 hover:bg-emerald-700 rounded-xl"
                disabled={
                  isSaving ||
                  updateEmailMutation.isPending ||
                  updatePhoneMutation.isPending ||
                  updateUsernameMutation.isPending
                }
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                    <span>در حال ذخیره...</span>
                  </>
                ) : (
                  "ذخیره تغییرات"
                )}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
