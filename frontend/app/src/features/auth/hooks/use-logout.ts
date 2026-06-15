import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { logout, LogoutResponse } from "@/lib/api/services/auth.servise";

export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation<LogoutResponse, Error, void>({
    mutationFn: async () => {
      return logout();
    },
    onSuccess: (response) => {
      toast.success(response.message || "خروج با موفقیت انجام شد");

      // Clear all cached queries (user data, etc.)
      queryClient.clear();

      // Redirect to login page
      router.push("/signin");
    },
    onError: (error: Error) => {
      toast.error(error.message || "خطا در خروج از حساب");
      console.error("Logout failed:", error);
    },
  });
}
