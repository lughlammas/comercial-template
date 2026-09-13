import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { formatBRL, sumItems } from "@/lib/money";

export default async function DashboardPage() {
  const user = await requireUser();
  const [clientCount, proposals] = await Promise.all([
    prisma.client.count({ where: { userId: user.id } }),
    prisma.proposal.findMany({
      where: { userId: user.id },
      include: { client: true, items: true },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
  ]);

  const totalValue = proposals.reduce((acc, p) => acc + sumItems(p.items), 0);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-muted">Painel</p>
        <h1 className="mt-1 font-serif text-4xl text-navy">Olá, {user.name}</h1>
        <p className="mt-2 text-muted">
          {user.companyName} · dados de exemplo se você entrou com a conta demo.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card">
          <p className="text-sm text-muted">Clientes</p>
          <p className="mt-2 font-serif text-4xl">{clientCount}</p>
        </div>
        <div className="card">
          <p className="text-sm text-muted">Propostas recentes</p>
          <p className="mt-2 font-serif text-4xl">{proposals.length}</p>
        </div>
        <div className="card">
          <p className="text-sm text-muted">Valor nas recentes</p>
          <p className="mt-2 font-serif text-3xl">{formatBRL(totalValue)}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        <Link href="/propostas/nova" className="btn-primary">
          Nova proposta
        </Link>
        <Link href="/clientes/novo" className="btn-ghost">
          Novo cliente
        </Link>
      </div>
      <section className="card">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl">Últimas propostas</h2>
          <Link href="/propostas" className="text-sm text-navy underline">
            Ver todas
          </Link>
        </div>
        {proposals.length === 0 ? (
          <p className="mt-4 text-sm text-muted">Nenhuma proposta ainda.</p>
        ) : (
          <ul className="mt-4 divide-y divide-line">
            {proposals.map((proposal) => (
              <li key={proposal.id} className="flex items-center justify-between py-3">
                <div>
                  <Link href={`/propostas/${proposal.id}`} className="font-medium hover:underline">
                    {proposal.title}
                  </Link>
                  <p className="text-sm text-muted">{proposal.client.name}</p>
                </div>
                <span className="text-sm">{formatBRL(sumItems(proposal.items))}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
