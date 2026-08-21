import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: {
    default: "سامانه رزرو آزمایشگاه",
    template: "%s | سامانه رزرو آزمایشگاه",
  },
  description:
    "سامانه رزرو صندلی و تجهیزات آزمایشگاه فناوری‌های مالی دانشگاه فردوسی مشهد",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" suppressHydrationWarning>
      <body className="min-h-dvh bg-white text-gray-900 antialiased dark:bg-gray-900 dark:text-white">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
