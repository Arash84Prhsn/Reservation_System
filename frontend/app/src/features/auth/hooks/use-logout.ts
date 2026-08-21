import { useAuth } from "@/shared/context/AuthContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { logout, type LogoutResponse } from "../api";

export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { logout: clearLocalSession } = useAuth();

  return useMutation<LogoutResponse, Error, void>({
    mutationFn: logout,
    onSuccess: (response) => {
      clearLocalSession();
      queryClient.clear();
      toast.success(response.message || "خروج با موفقیت انجام شد");
      router.replace("/signin");
    },
    onError: (error) => {
      toast.error(error.message || "خطا در خروج از حساب");
    },
  });
}
