import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { formatBRL, sumItems } from "@/lib/money";

const statusLabel: Record<string, string> = {
  rascunho: "Rascunho",
  enviada: "Enviada",
  aceita: "Aceita",
};

export default async function ProposalsPage() {
  const user = await requireUser();
  const proposals = await prisma.proposal.findMany({
    where: { userId: user.id },
    include: { client: true, items: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted">Comercial</p>
          <h1 className="font-serif text-4xl text-navy">Propostas</h1>
        </div>
        <Link href="/propostas/nova" className="btn-primary">
          Nova proposta
        </Link>
      </div>
      {proposals.length === 0 ? (
        <div className="card text-muted">Nenhuma proposta ainda.</div>
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-5 py-3">Título</th>
                <th className="px-5 py-3">Cliente</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {proposals.map((proposal) => (
                <tr key={proposal.id} className="border-b border-line last:border-0">
                  <td className="px-5 py-3">
                    <Link href={`/propostas/${proposal.id}`} className="font-medium hover:underline">
                      {proposal.title}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-muted">{proposal.client.name}</td>
                  <td className="px-5 py-3">{statusLabel[proposal.status] ?? proposal.status}</td>
                  <td className="px-5 py-3 text-right">{formatBRL(sumItems(proposal.items))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
