import NewSignInForm from "@/features/auth/components/NewSignInForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ورود",
  description: "ورود به سامانه رزرو آزمایشگاه فناوری‌های مالی.",
};

export default function SignInPage() {
  return <NewSignInForm />;
}
