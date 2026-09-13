"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerUser } from "@/lib/actions";

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    const result = await registerUser(formData);
    setPending(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    router.push("/login?registered=1");
  }

  return (
    <form action={onSubmit} className="card space-y-4">
      <div>
        <label className="label" htmlFor="name">
          Seu nome
        </label>
        <input id="name" name="name" required className="input" placeholder="Ana Silva" />
      </div>
      <div>
        <label className="label" htmlFor="companyName">
          Nome da empresa
        </label>
        <input id="companyName" name="companyName" className="input" placeholder="Estúdio Exemplo" />
      </div>
      <div>
        <label className="label" htmlFor="email">
          E-mail
        </label>
        <input id="email" name="email" type="email" required className="input" />
      </div>
      <div>
        <label className="label" htmlFor="password">
          Senha (mín. 8 caracteres)
        </label>
        <input id="password" name="password" type="password" minLength={8} required className="input" />
      </div>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <button type="submit" className="btn-primary w-full" disabled={pending}>
        {pending ? "Criando…" : "Criar conta"}
      </button>
    </form>
  );
}
