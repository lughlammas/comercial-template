"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

function str(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function registerUser(formData: FormData) {
  const name = str(formData, "name");
  const companyName = str(formData, "companyName") || "Sua Empresa";
  const email = str(formData, "email").toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!name || !email || password.length < 8) {
    return { error: "Preencha nome, e-mail e uma senha com pelo menos 8 caracteres." };
  }

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    return { error: "Já existe uma conta com este e-mail." };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: { name, companyName, email, passwordHash },
  });

  return { ok: true };
}

export async function createClient(formData: FormData) {
  const user = await requireUser();
  const name = str(formData, "name");
  if (!name) {
    return { error: "Informe o nome do cliente." };
  }

  const client = await prisma.client.create({
    data: {
      userId: user.id,
      name,
      email: str(formData, "email") || null,
      company: str(formData, "company") || null,
      phone: str(formData, "phone") || null,
      notes: str(formData, "notes") || null,
    },
  });

  revalidatePath("/clientes");
  revalidatePath("/dashboard");
  redirect(`/clientes/${client.id}`);
}

export async function createProposal(payload: {
  clientId: string;
  title: string;
  notes?: string;
  items: { description: string; quantity: number; unitPrice: number }[];
}) {
  const user = await requireUser();
  const title = payload.title.trim();
  const clientId = payload.clientId;
  const items = (payload.items ?? []).filter(
    (item) => item.description.trim() && item.quantity > 0,
  );

  if (!title || !clientId) {
    return { error: "Informe o cliente e o título da proposta." };
  }
  if (items.length === 0) {
    return { error: "Adicione pelo menos um item com descrição e quantidade." };
  }

  const client = await prisma.client.findFirst({
    where: { id: clientId, userId: user.id },
  });
  if (!client) {
    return { error: "Cliente não encontrado." };
  }

  const proposal = await prisma.proposal.create({
    data: {
      userId: user.id,
      clientId,
      title,
      notes: payload.notes?.trim() || null,
      status: "rascunho",
      items: {
        create: items.map((item) => ({
          description: item.description.trim(),
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice) || 0,
        })),
      },
    },
  });

  revalidatePath("/propostas");
  revalidatePath("/dashboard");
  redirect(`/propostas/${proposal.id}`);
}
