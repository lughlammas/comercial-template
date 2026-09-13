# Comercial

Template SaaS reutilizável para **micro-ferramentas B2B**. O primeiro recorte é um **gerador de propostas comerciais**: clientes, itens, totais e PDF.

Use como base. Depois clone para recibos, contratos ou orçamentos — o playbook está em [`docs/CLONE_PLAYBOOK.md`](docs/CLONE_PLAYBOOK.md).

## O que já vem pronto

- Landing comercial (hero, recursos, tabela de preços placeholder, CTA de personalização)
- Autenticação por e-mail e senha (NextAuth, sessão JWT)
- Painel protegido
- CRUD mínimo de **clientes** e **propostas** (criar, listar, ver)
- Formulário com nome do cliente, título, itens (descrição, qtd, preço) e totais
- Geração e download de PDF da proposta
- Prisma + SQLite no desenvolvimento (comentários no schema para Postgres)
- Docker e `.env.example`

Interface em **português do Brasil**.

## Demo

Dados de **exemplo** — não use em produção.

| Campo  | Valor                   |
|--------|-------------------------|
| E-mail | `demo@comercial.local`  |
| Senha  | `demo1234`              |

A seed cria três clientes e três propostas fictícias (Ateliê Norte, Mercado Aurora, Clínica Verde).

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- NextAuth Credentials + JWT
- Prisma + SQLite (`prisma/dev.db`)
- PDF com `@react-pdf/renderer`
- Node 20+

## Como rodar

```bash
git clone https://github.com/lughlammas/comercial-template.git
cd comercial-template
cp .env.example .env
npm install
npx prisma db push
npm run seed
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) e entre com a demo.

A sequência pedida no critério de aceite:

```bash
npm install && npx prisma db push && npm run seed && npm run build
```

### Scripts

| Script        | Função                                      |
|---------------|---------------------------------------------|
| `npm run dev` | Servidor de desenvolvimento                 |
| `npm run build` | Build de produção                         |
| `npm start`   | Sobe o build (`next start`)                 |
| `npm run db:push` | Aplica o schema no banco (`prisma db push`) |
| `npm run seed` | Recria o usuário demo e os dados de exemplo |

`postinstall` já roda `prisma generate`.

## Variáveis de ambiente

Veja `.env.example`.

| Variável          | Uso                                              |
|-------------------|--------------------------------------------------|
| `DATABASE_URL`    | SQLite: `file:./dev.db` (relativo a `prisma/`)   |
| `NEXTAUTH_SECRET` | Segredo JWT (gere outro em produção)             |
| `NEXTAUTH_URL`    | URL pública, ex. `http://localhost:3000`         |

Em produção com **Postgres**, troque o `provider` em `prisma/schema.prisma` (há um bloco comentado) e use:

```
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/comercial?schema=public"
```

## Deploy

1. Suba o código (Vercel, Railway, Fly, VPS + Docker).
2. Defina `NEXTAUTH_SECRET`, `NEXTAUTH_URL` e `DATABASE_URL`.
3. Rode `npx prisma db push` (ou `migrate deploy` quando houver migrations) e `npm run seed` só se quiser a demo.
4. `npm run build && npm start`, ou a imagem Docker.

### Docker

```bash
docker build -t comercial-template .
docker run --rm -p 3000:3000 \
  -e NEXTAUTH_SECRET=um-segredo-longo \
  -e NEXTAUTH_URL=http://localhost:3000 \
  -e DATABASE_URL=file:./dev.db \
  comercial-template
```

SQLite dentro do container é só para smoke test. Em produção, use Postgres e um volume ou um banco gerenciado.

## Caminhos úteis

| Caminho | Conteúdo |
|---------|----------|
| `prisma/schema.prisma` | Modelos User, Client, Proposal, ProposalItem |
| `prisma/seed.ts` | Demo `demo@comercial.local` |
| `src/lib/auth.ts` | NextAuth credentials + JWT |
| `src/app/page.tsx` | Landing |
| `src/app/(app)/` | Painel, clientes, propostas |
| `src/components/proposal-form.tsx` | Formulário de itens |
| `src/components/proposal-pdf.tsx` | Layout do PDF |
| `src/app/api/propostas/[id]/pdf/route.ts` | Download do PDF |
| `docs/CUSTOMIZATION.md` | Como trocar marca, textos e cores |
| `docs/CLONE_PLAYBOOK.md` | Como forkear para outro produto |
| `screenshots/` | Pasta para prints do produto |

## Tabela de preços (placeholder)

Números ilustrativos — ajuste à sua oferta. Nada aqui cobra de fato.

| Plano     | Preço        | Para quem                         |
|-----------|--------------|-----------------------------------|
| Starter   | R$ 0         | Uso interno, 1 usuário            |
| Pro       | R$ 97/mês    | Equipe pequena, marca própria     |
| Business  | Sob consulta | White-label e personalização      |

## Pitch de personalização

Este repositório é a **base comercial**. Dá para:

- Colocar a sua marca, domínio e tom de voz
- Trocar “proposta” por recibo, contrato ou orçamento
- Ligar em Postgres, e-mail e cobrança quando fizer sentido
- Entregar um micro-SaaS pronto para o escritório do cliente

Leia [`docs/CUSTOMIZATION.md`](docs/CUSTOMIZATION.md) e [`docs/CLONE_PLAYBOOK.md`](docs/CLONE_PLAYBOOK.md). O CTA da landing aponta para `contato@exemplo.local` — troque pelo seu canal.

## Licença

Uso interno e forks do time. Ajuste esta seção se for publicar o template.
