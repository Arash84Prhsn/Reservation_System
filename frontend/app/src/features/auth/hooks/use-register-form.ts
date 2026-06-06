import { useState } from "react";
import { useRouter } from "next/navigation";
import { AssociationStatus, register } from "@/lib/api/services/auth.servise";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export function useRegisterForm() {
  const router = useRouter();

  //STATES
  const [association, setAssociation] = useState<AssociationStatus>(
    AssociationStatus.None,
  );
  const [phone, setPhone] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
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
      } = await register({
        association,
        email,
        password,
        phone,
        username,
      });

      // false success is handled in the API service, so no need to check success here.
      // if (success) {
      toast.success(message || "ثبت‌نام با موفقیت انجام شد");
      // }

      // set user to local storage
      LocalLogin({
        username: receivedUser.username,
        email: receivedUser.email,
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
