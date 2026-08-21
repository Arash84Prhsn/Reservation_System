import { useAuth } from "@/shared/context/AuthContext";
import { login } from "../api";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function useLoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login: localLogin } = useAuth();

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (pending) return;

    const normalizedUsername = username.trim();
    if (!normalizedUsername || !password) {
      const message = "نام کاربری و رمز عبور را وارد کنید";
      setError(message);
      toast.error(message);
      return;
    }

    setPending(true);
    setError(null);

    try {
      const { data: receivedUser, message } = await login({
        username: normalizedUsername,
        password,
      });

      toast.success(message || "ورود با موفقیت انجام شد");
      localLogin(receivedUser);
      router.replace("/");
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : typeof err === "string"
            ? err
            : "مشکلی پیش آمده است";

      setError(message);
      toast.error(message);
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
    error,
    onSubmit,
  };
}
