import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { formatBRL, sumItems } from "@/lib/money";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const client = await prisma.client.findFirst({
    where: { id, userId: user.id },
    include: {
      proposals: {
        include: { items: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!client) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link href="/clientes" className="text-sm text-muted hover:underline">
          ← Clientes
        </Link>
        <h1 className="mt-2 font-serif text-4xl text-navy">{client.name}</h1>
        <p className="text-muted">{client.company ?? "Sem empresa"}</p>
      </div>
      <div className="card space-y-1 text-sm">
        <p>E-mail: {client.email ?? "—"}</p>
        <p>Telefone: {client.phone ?? "—"}</p>
        {client.notes ? <p className="pt-2 text-muted">{client.notes}</p> : null}
      </div>
      <div className="flex gap-3">
        <Link href="/propostas/nova" className="btn-primary">
          Nova proposta
        </Link>
      </div>
      <section className="card">
        <h2 className="font-serif text-2xl">Propostas</h2>
        {client.proposals.length === 0 ? (
          <p className="mt-3 text-sm text-muted">Nenhuma proposta para este cliente.</p>
        ) : (
          <ul className="mt-4 divide-y divide-line">
            {client.proposals.map((proposal) => (
              <li key={proposal.id} className="flex justify-between py-3">
                <Link href={`/propostas/${proposal.id}`} className="hover:underline">
                  {proposal.title}
                </Link>
                <span>{formatBRL(sumItems(proposal.items))}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
