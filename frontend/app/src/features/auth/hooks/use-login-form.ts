import { useAuth } from "@/context/AuthContext";
import { login } from "@/lib/api/services/auth.servise";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function useLoginForm() {
  const router = useRouter();

  //STATES
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  //HOOKS
  const { login: LocalLogin } = useAuth();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);

    try {
      const {
        data: receivedUser,
        // success,
        message,
      } = await login({
        username,
        password,
      });

      toast.success(message || "ورود با موفقیت انجام شد");

      // set user to local storage
      LocalLogin({
        email: receivedUser.email,
        username: receivedUser.username,
        id: receivedUser.id,
        association: receivedUser.association,
        phone: receivedUser.phone,
      });

      // go to dashboard
      router.replace("/");
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : typeof err === "string"
            ? err
            : "مشکلی پیش آمده است";

      setError(message);
    } finally {
      setPending(false);
    }
  }

  return {
    username,
    setUsername,
    password,
    setPassword,
    pending,
    setPending,
    error,
    setError,
    onSubmit,
  };
}
