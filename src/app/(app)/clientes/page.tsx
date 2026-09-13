import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export default async function ClientsPage() {
  const user = await requireUser();
  const clients = await prisma.client.findMany({
    where: { userId: user.id },
    include: { _count: { select: { proposals: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted">Cadastro</p>
          <h1 className="font-serif text-4xl text-navy">Clientes</h1>
        </div>
        <Link href="/clientes/novo" className="btn-primary">
          Novo cliente
        </Link>
      </div>
      {clients.length === 0 ? (
        <div className="card text-muted">Nenhum cliente ainda. Crie o primeiro.</div>
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-5 py-3">Nome</th>
                <th className="px-5 py-3">Empresa</th>
                <th className="px-5 py-3">E-mail</th>
                <th className="px-5 py-3">Propostas</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.id} className="border-b border-line last:border-0">
                  <td className="px-5 py-3">
                    <Link href={`/clientes/${client.id}`} className="font-medium hover:underline">
                      {client.name}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-muted">{client.company ?? "—"}</td>
                  <td className="px-5 py-3 text-muted">{client.email ?? "—"}</td>
                  <td className="px-5 py-3">{client._count.proposals}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
