import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "demo@comercial.local";
  const passwordHash = await bcrypt.hash("demo1234", 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: { passwordHash },
    create: {
      email,
      passwordHash,
      name: "Ana Demo",
      companyName: "Estúdio Crono",
    },
  });

  await prisma.proposalItem.deleteMany({
    where: { proposal: { userId: user.id } },
  });
  await prisma.proposal.deleteMany({ where: { userId: user.id } });
  await prisma.client.deleteMany({ where: { userId: user.id } });

  const atelie = await prisma.client.create({
    data: {
      userId: user.id,
      name: "Marina Costa",
      company: "Ateliê Norte Ltda",
      email: "marina@atelienorte.example",
      phone: "(11) 98888-1100",
      notes: "Cliente recorrente — prefere PDF com itens detalhados.",
    },
  });

  const aurora = await prisma.client.create({
    data: {
      userId: user.id,
      name: "Rafael Mendes",
      company: "Mercado Aurora",
      email: "rafael@aurora.example",
      phone: "(21) 97777-2200",
    },
  });

  const clinica = await prisma.client.create({
    data: {
      userId: user.id,
      name: "Dra. Helena Dias",
      company: "Clínica Verde",
      email: "contato@clinicaverde.example",
      phone: "(31) 96666-3300",
    },
  });

  await prisma.proposal.create({
    data: {
      userId: user.id,
      clientId: atelie.id,
      title: "Identidade visual e papelaria",
      notes:
        "Entrega em 20 dias úteis após aprovação. Inclui duas rodadas de revisão.",
      status: "enviada",
      items: {
        create: [
          { description: "Pesquisa e direção de marca", quantity: 1, unitPrice: 2800 },
          { description: "Logotipo + variações", quantity: 1, unitPrice: 4200 },
          { description: "Papelaria (cartão, envelope, assinatura)", quantity: 1, unitPrice: 1600 },
        ],
      },
    },
  });

  await prisma.proposal.create({
    data: {
      userId: user.id,
      clientId: aurora.id,
      title: "Site institucional + catálogo",
      notes: "Valores em reais. Hospedagem e domínio ficam a cargo do cliente.",
      status: "rascunho",
      items: {
        create: [
          { description: "Arquitetura de informação e wireframes", quantity: 1, unitPrice: 2400 },
          { description: "Páginas institucionais (até 6)", quantity: 6, unitPrice: 650 },
          { description: "Catálogo de produtos (até 40 itens)", quantity: 1, unitPrice: 3200 },
        ],
      },
    },
  });

  await prisma.proposal.create({
    data: {
      userId: user.id,
      clientId: clinica.id,
      title: "Pacote de comunicação para lançamento",
      status: "aceita",
      notes: "Dados de exemplo — substitua pelos seus no painel.",
      items: {
        create: [
          { description: "Kit de peças para redes (10 artes)", quantity: 1, unitPrice: 1800 },
          { description: "Revisão de textos", quantity: 8, unitPrice: 120 },
        ],
      },
    },
  });

  console.log("Seed ok.");
  console.log("  E-mail : demo@comercial.local");
  console.log("  Senha  : demo1234");
  console.log("  (dados de exemplo — não use em produção)");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
