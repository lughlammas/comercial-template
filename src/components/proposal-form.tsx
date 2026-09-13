"use client";

import { useMemo, useState } from "react";
import { createProposal } from "@/lib/actions";
import { formatBRL, lineTotal, sumItems } from "@/lib/money";

type ClientOption = { id: string; name: string; company: string | null };
type Line = { description: string; quantity: string; unitPrice: string };

const emptyLine: Line = { description: "", quantity: "1", unitPrice: "0" };

export function ProposalForm({ clients }: { clients: ClientOption[] }) {
  const [title, setTitle] = useState("");
  const [clientId, setClientId] = useState(clients[0]?.id ?? "");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<Line[]>([{ ...emptyLine }]);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const parsed = useMemo(
    () =>
      items.map((item) => ({
        description: item.description,
        quantity: Number(item.quantity) || 0,
        unitPrice: Number(item.unitPrice) || 0,
      })),
    [items],
  );
  const total = sumItems(parsed);

  function updateLine(index: number, patch: Partial<Line>) {
    setItems((current) => current.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const result = await createProposal({
      clientId,
      title,
      notes,
      items: parsed,
    });
    if (result?.error) {
      setError(result.error);
      setPending(false);
    }
  }

  if (clients.length === 0) {
    return (
      <div className="card">
        <p className="text-muted">
          Cadastre um cliente antes de criar a primeira proposta.
        </p>
        <a href="/clientes/novo" className="btn-primary mt-4 inline-flex">
          Novo cliente
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="card space-y-4">
        <div>
          <label className="label" htmlFor="title">
            Título da proposta
          </label>
          <input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="input"
            placeholder="Identidade visual e papelaria"
          />
        </div>
        <div>
          <label className="label" htmlFor="clientId">
            Cliente
          </label>
          <select
            id="clientId"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className="input"
          >
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
                {client.company ? ` — ${client.company}` : ""}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="notes">
            Observações (opcional)
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="input"
            placeholder="Prazo, condições, o que está fora do escopo…"
          />
        </div>
      </div>

      <div className="card space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl">Itens</h2>
          <button
            type="button"
            className="btn-ghost"
            onClick={() => setItems((current) => [...current, { ...emptyLine }])}
          >
            Adicionar item
          </button>
        </div>
        <div className="hidden grid-cols-12 gap-2 text-xs uppercase tracking-wide text-muted sm:grid">
          <div className="col-span-6">Descrição</div>
          <div className="col-span-2">Qtd</div>
          <div className="col-span-2">Preço</div>
          <div className="col-span-2 text-right">Total</div>
        </div>
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={index} className="grid grid-cols-12 items-center gap-2">
              <input
                className="input col-span-12 sm:col-span-6"
                placeholder="Descrição"
                value={item.description}
                onChange={(e) => updateLine(index, { description: e.target.value })}
              />
              <input
                className="input col-span-4 sm:col-span-2"
                type="number"
                min="0"
                step="0.01"
                value={item.quantity}
                onChange={(e) => updateLine(index, { quantity: e.target.value })}
              />
              <input
                className="input col-span-4 sm:col-span-2"
                type="number"
                min="0"
                step="0.01"
                value={item.unitPrice}
                onChange={(e) => updateLine(index, { unitPrice: e.target.value })}
              />
              <div className="col-span-3 text-right text-sm sm:col-span-1">
                {formatBRL(lineTotal(Number(item.quantity) || 0, Number(item.unitPrice) || 0))}
              </div>
              <button
                type="button"
                className="col-span-1 text-xs text-muted hover:text-danger"
                onClick={() =>
                  setItems((current) =>
                    current.length === 1 ? current : current.filter((_, i) => i !== index),
                  )
                }
                aria-label="Remover item"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <div className="flex justify-end border-t border-line pt-4">
          <p className="text-lg">
            Total{" "}
            <span className="font-serif text-2xl text-navy">{formatBRL(total)}</span>
          </p>
        </div>
      </div>

      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <button type="submit" className="btn-primary" disabled={pending}>
        {pending ? "Salvando…" : "Salvar proposta"}
      </button>
    </form>
  );
}
