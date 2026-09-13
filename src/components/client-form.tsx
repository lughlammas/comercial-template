"use client";

import { useState } from "react";
import { createClient } from "@/lib/actions";

export function ClientForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    const result = await createClient(formData);
    if (result?.error) {
      setError(result.error);
      setPending(false);
    }
  }

  return (
    <form action={onSubmit} className="card space-y-4">
      <div>
        <label className="label" htmlFor="name">
          Nome do cliente
        </label>
        <input id="name" name="name" required className="input" placeholder="Marina Costa" />
      </div>
      <div>
        <label className="label" htmlFor="company">
          Empresa
        </label>
        <input id="company" name="company" className="input" placeholder="Ateliê Norte Ltda" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="email">
            E-mail
          </label>
          <input id="email" name="email" type="email" className="input" placeholder="contato@empresa.com" />
        </div>
        <div>
          <label className="label" htmlFor="phone">
            Telefone
          </label>
          <input id="phone" name="phone" className="input" placeholder="(11) 99999-0000" />
        </div>
      </div>
      <div>
        <label className="label" htmlFor="notes">
          Observações
        </label>
        <textarea id="notes" name="notes" rows={3} className="input" />
      </div>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <button type="submit" className="btn-primary" disabled={pending}>
        {pending ? "Salvando…" : "Salvar cliente"}
      </button>
    </form>
  );
}
