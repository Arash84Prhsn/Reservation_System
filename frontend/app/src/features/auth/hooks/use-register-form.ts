import { useState } from "react";
import { useRouter } from "next/navigation";
import { AssociationStatus, register } from "../api";
import { useAuth } from "@/shared/context/AuthContext";
import { toast } from "sonner";

export function useRegisterForm() {
  const router = useRouter();
  const [association, setAssociation] = useState<AssociationStatus>(
    AssociationStatus.None,
  );
  const [phone, setPhone] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login: localLogin } = useAuth();

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (pending) return;

    const normalizedUsername = username.trim();
    const normalizedEmail = email.trim();
    const normalizedPhone = phone.trim();

    if (association === AssociationStatus.None) {
      const message = "نوع همکاری یا وضعیت دانشگاهی را انتخاب کنید";
      setError(message);
      toast.error(message);
      return;
    }

    if (!/^09\d{9}$/.test(normalizedPhone)) {
      const message = "شماره تلفن باید ۱۱ رقم و با 09 شروع شود";
      setError(message);
      toast.error(message);
      return;
    }

    setPending(true);
    setError(null);

    try {
      const { data: receivedUser, message } = await register({
        association,
        email: normalizedEmail,
        password,
        phone: normalizedPhone,
        username: normalizedUsername,
      });

      toast.success(message || "ثبت‌نام با موفقیت انجام شد");
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
    email,
    password,
    pending,
    error,
    username,
    phone,
    association,
    setEmail,
    setPassword,
    onSubmit,
    setPhone,
    setUsername,
    setAssociation,
  };
}
