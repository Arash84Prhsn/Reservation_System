"use client";

import { AuthProvider } from "@/shared/context/AuthContext";
import { SidebarProvider } from "@/shared/context/SidebarContext";
import { ThemeProvider } from "@/shared/context/ThemeContext";
import { createQueryClient } from "@/shared/lib/react-query/query-client";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";
import { Toaster } from "sonner";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <SidebarProvider>{children}</SidebarProvider>
          <Toaster richColors position="top-center" />
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
