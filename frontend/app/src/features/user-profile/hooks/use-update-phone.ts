import { updatePhone, UpdatePhoneResponse } from "@/lib/api/services/auth.servise";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { userKeys } from "../queryKeys";

export function useUpdatePhone() {
  const queryClient = useQueryClient();
  return useMutation<UpdatePhoneResponse, Error, string>({
    mutationFn: updatePhone,
    onSuccess: async (response: { message: any; }) => {
      toast.success(response.message || "تلفن با موفقیت بروزرسانی شد");
      await queryClient.invalidateQueries({ queryKey: userKeys.profile() });
    },
    onError: (error: any) => {
      toast.error(error.message || "بروزرسانی تلفن ناموفق بود");
    },
  });
}