import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { userKeys } from "../queryKeys";
import { user_profile } from "@/lib/api/services/auth.servise";

export function useUserProfile() {
  return useQuery({
    queryKey: userKeys.profile(),
    queryFn: async () => {
      const response = await user_profile();
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
