# Clone playbook

Como nascer um produto novo a partir deste template sem reescrever o osso.

## Quando clonar

O template resolve: **conta → cadastro de contraparte → documento com itens → PDF**.

Cabe em:

| Fork | Documento | Contraparte |
|------|-----------|-------------|
| Este repo | Proposta comercial | Cliente |
| Recibos | Recibo / comprovante | Pagador |
| Contratos | Minuta com cláusulas + valor | Contratante |
| Orçamentos | Orçamento (pode virar proposta) | Lead / cliente |

Se o fluxo for outro (inbox, agenda, estoque), comece do zero ou extraia só auth + Prisma.

## Passos

1. **Fork ou “Use this template”** no GitHub. Renomeie o repo.
2. Clone local, `cp .env.example .env`, `npm install`.
3. Troque o nome do produto (veja `docs/CUSTOMIZATION.md`).
4. Decida o vocabulário:
   - rotas `/propostas` → `/recibos` (ou `/contratos`, `/orcamentos`)
   - model `Proposal` → nome do documento
   - labels na UI e no PDF
5. Ajuste campos extras (ex.: data de competência no recibo, vigência no contrato).
6. `npx prisma db push` e uma seed com **dados de exemplo** do novo domínio.
7. Atualize README, preços placeholder e o CTA de personalização.
8. Suba um preview, tire prints em `screenshots/`.

## O que reaproveitar de propósito

- NextAuth credentials + JWT (`src/lib/auth.ts`)
- Layout do painel (`src/components/app-shell.tsx`)
- Padrão criar / listar / ver
- Formulário de linhas + totais (`src/components/proposal-form.tsx`)
- Pipeline de PDF (componente + rota `/api/.../pdf`)
- Landing em blocos (hero, recursos, preços, CTA)

## O que não copiar cego

- Textos de “proposta” e a seed do Estúdio Crono
- Tabela de preços da landing
- SQLite em produção
- O e-mail `contato@exemplo.local`

## Ordem sugerida de forks

1. **Propostas** (este produto) — valida a base.
2. **Orçamentos** — quase o mesmo documento, status diferentes.
3. **Recibos** — menos itens, mais data/meio de pagamento.
4. **Contratos** — mais texto jurídico, menos tabela; o PDF ganha seções.

Cada fork vira um repo (ou um app no monorepo) com marca própria. Não tente um “super-app” com os quatro no primeiro sprint.

## Critério de pronto de um clone

- `npm install && npx prisma db push && npm run seed && npm run build` passa
- Demo documentada no README
- Landing com a oferta nova
- PDF baixável com a marca nova
- Playbook e customização atualizados (ou linkados para cá)
