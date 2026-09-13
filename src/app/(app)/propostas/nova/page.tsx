import Link from "next/link";
import { ProposalForm } from "@/components/proposal-form";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export default async function NewProposalPage() {
  const user = await requireUser();
  const clients = await prisma.client.findMany({
    where: { userId: user.id },
    orderBy: { name: "asc" },
    select: { id: true, name: true, company: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <Link href="/propostas" className="text-sm text-muted hover:underline">
          ← Propostas
        </Link>
        <h1 className="mt-2 font-serif text-4xl text-navy">Nova proposta</h1>
        <p className="mt-1 text-muted">Cliente, título, itens e totais automáticos.</p>
      </div>
      <ProposalForm clients={clients} />
    </div>
  );
}
