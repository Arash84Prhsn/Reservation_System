import {
  updateEmail,
  UpdateEmailResponse,
} from "@/lib/api/services/auth.servise";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { userKeys } from "../queryKeys";

export function useUpdateEmail() {
  const queryClient = useQueryClient();
  return useMutation<UpdateEmailResponse, Error, string>({
    mutationFn: updateEmail,
    onSuccess: async (response) => {
      toast.success(response.message || "ایمیل با موفقیت بروزرسانی شد");
      await queryClient.invalidateQueries({ queryKey: userKeys.profile() });
    },
    onError: (error: any) => {
      toast.error(error.message || "بروزرسانی ایمیل ناموفق بود");
    },
  });
}
