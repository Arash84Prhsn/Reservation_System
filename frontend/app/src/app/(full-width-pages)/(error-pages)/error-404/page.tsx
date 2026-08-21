import NotFoundView from "@/shared/components/feedback/NotFoundView";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "صفحه پیدا نشد",
  description: "صفحه مورد نظر در سامانه رزرو آزمایشگاه پیدا نشد.",
};

export default function Error404Page() {
  return <NotFoundView />;
}
