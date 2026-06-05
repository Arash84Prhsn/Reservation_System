// import { Outfit } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

import { SidebarProvider } from "@/context/SidebarContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import { Providers } from "./providers";

// const outfit = Outfit({
//   subsets: ["latin"],
// });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className={` dark:bg-gray-900`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
