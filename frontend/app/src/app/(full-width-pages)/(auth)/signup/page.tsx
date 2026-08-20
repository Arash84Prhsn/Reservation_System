import NewSignUpForm from "@/features/auth/components/NewSignUpForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ثبت نام",
  description: "ایجاد حساب کاربری در سامانه رزرو آزمایشگاه فناوری‌های مالی.",
};

export default function SignUpPage() {
  return <NewSignUpForm />;
}
