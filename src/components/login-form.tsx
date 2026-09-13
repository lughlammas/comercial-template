"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState<string | null>(
    params.get("registered") ? null : null,
  );
  const [pending, setPending] = useState(false);
  const registered = params.get("registered") === "1";

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    const result = await signIn("credentials", {
      email: String(form.get("email") ?? ""),
      password: String(form.get("password") ?? ""),
      redirect: false,
    });
    setPending(false);
    if (result?.error) {
      setError("E-mail ou senha inválidos.");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-4">
      {registered ? (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-success">
          Conta criada. Entre com o e-mail e a senha.
        </p>
      ) : null}
      <div>
        <label className="label" htmlFor="email">
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          defaultValue="demo@comercial.local"
          className="input"
        />
      </div>
      <div>
        <label className="label" htmlFor="password">
          Senha
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          defaultValue="demo1234"
          className="input"
        />
      </div>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <button type="submit" className="btn-primary w-full" disabled={pending}>
        {pending ? "Entrando…" : "Entrar"}
      </button>
      <p className="text-xs text-muted">
        Demo de exemplo: demo@comercial.local / demo1234
      </p>
    </form>
  );
}
