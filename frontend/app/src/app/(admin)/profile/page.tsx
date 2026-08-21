import UserProfile from "@/features/user-profile/components/UserProfile";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "پروفایل",
  description: "مشاهده و ویرایش اطلاعات حساب کاربری سامانه رزرو آزمایشگاه.",
};

export default function ProfilePage() {
  return <UserProfile />;
}
