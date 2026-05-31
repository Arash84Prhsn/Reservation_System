import { useState } from "react";
import { useRouter } from "next/navigation";
import { AssociationStatus, register } from "@/lib/api/services/auth.servise";

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

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);

    try {
      await register({ association, email, password, phone, username });
      router.replace("/");
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : typeof err === "string"
            ? err
            : "ورود ناموفق بود";

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
