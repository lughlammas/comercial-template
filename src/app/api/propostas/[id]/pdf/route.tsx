import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { renderToBuffer } from "@react-pdf/renderer";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProposalPdf } from "@/components/proposal-pdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { id } = await context.params;
  const proposal = await prisma.proposal.findFirst({
    where: { id, userId: session.user.id },
    include: { client: true, items: true, user: true },
  });

  if (!proposal) {
    return NextResponse.json({ error: "Proposta não encontrada" }, { status: 404 });
  }

  const buffer = await renderToBuffer(
    <ProposalPdf
      proposal={{
        title: proposal.title,
        notes: proposal.notes,
        createdAt: proposal.createdAt,
        status: proposal.status,
        companyName: proposal.user.companyName,
        sellerName: proposal.user.name,
        clientName: proposal.client.name,
        clientCompany: proposal.client.company,
        clientEmail: proposal.client.email,
        items: proposal.items.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      }}
    />,
  );

  const filename = `proposta-${proposal.id}.pdf`;

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
