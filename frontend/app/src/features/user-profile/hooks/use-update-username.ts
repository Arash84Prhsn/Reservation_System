import { updateUsername, UpdateUsernameResponse } from "@/lib/api/services/auth.servise";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { userKeys } from "../queryKeys";

export function useUpdateUsername() {
  const queryClient = useQueryClient();
  return useMutation<UpdateUsernameResponse, Error, string>({
    mutationFn: updateUsername,
    onSuccess: async (response) => {
      toast.success(response.message || "نام کاربری با موفقیت بروزرسانی شد");
      await queryClient.invalidateQueries({ queryKey: userKeys.profile() });
    },
    onError: (error: any) => {
      toast.error(error.message || "بروزرسانی نام کاربری ناموفق بود");
    },
  });
}