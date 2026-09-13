import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { formatBRL, lineTotal, sumItems } from "@/lib/money";

const statusLabel: Record<string, string> = {
  rascunho: "Rascunho",
  enviada: "Enviada",
  aceita: "Aceita",
};

export default async function ProposalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const proposal = await prisma.proposal.findFirst({
    where: { id, userId: user.id },
    include: { client: true, items: true, user: true },
  });
  if (!proposal) notFound();
  const total = sumItems(proposal.items);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/propostas" className="text-sm text-muted hover:underline">
            ← Propostas
          </Link>
          <h1 className="mt-2 font-serif text-4xl text-navy">{proposal.title}</h1>
          <p className="mt-1 text-muted">
            {proposal.client.name}
            {proposal.client.company ? ` · ${proposal.client.company}` : ""} ·{" "}
            {statusLabel[proposal.status] ?? proposal.status}
          </p>
        </div>
        <a href={`/api/propostas/${proposal.id}/pdf`} className="btn-primary">
          Baixar PDF
        </a>
      </div>
      <div className="card overflow-x-auto p-0">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-5 py-3">Descrição</th>
              <th className="px-5 py-3 text-right">Qtd</th>
              <th className="px-5 py-3 text-right">Preço</th>
              <th className="px-5 py-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {proposal.items.map((item) => (
              <tr key={item.id} className="border-b border-line">
                <td className="px-5 py-3">{item.description}</td>
                <td className="px-5 py-3 text-right">{item.quantity}</td>
                <td className="px-5 py-3 text-right">{formatBRL(item.unitPrice)}</td>
                <td className="px-5 py-3 text-right">
                  {formatBRL(lineTotal(item.quantity, item.unitPrice))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-end px-5 py-4">
          <p className="font-serif text-2xl">Total {formatBRL(total)}</p>
        </div>
      </div>
      {proposal.notes ? (
        <div className="card">
          <h2 className="text-sm uppercase tracking-wide text-muted">Observações</h2>
          <p className="mt-2 whitespace-pre-wrap">{proposal.notes}</p>
        </div>
      ) : null}
    </div>
  );
}
