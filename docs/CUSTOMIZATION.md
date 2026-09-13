# Personalização

Guia curto para deixar o template com a cara do cliente (ou do próximo produto).

## Marca

| O quê | Onde |
|-------|------|
| Nome do produto | `src/components/app-shell.tsx`, `src/app/page.tsx`, `README.md` |
| Título da aba | `src/app/layout.tsx` → `metadata` |
| Empresa no PDF | campo `companyName` do usuário (registro / seed) |
| E-mail de personalização | CTA da landing (`mailto:`) |

Troque “Comercial” pelo nome do produto. Mantenha um nome curto — ele aparece no PDF e no menu.

## Visual

Cores e tokens estão em `src/app/globals.css` (`:root` + `@theme inline`):

- `--navy` / `--navy-deep` — fundos escuros e botão principal
- `--accent` — dourado da landing e do kicker
- `--paper` / `--background` — superfícies claras
- `--font-newsreader` — títulos (serif)
- `--font-geist-sans` — texto

Classes utilitárias: `.card`, `.input`, `.btn-primary`, `.btn-accent`, `.btn-ghost`.

O PDF (`src/components/proposal-pdf.tsx`) tem paleta própria em `StyleSheet`. Alinhe com a marca se for white-label.

## Textos e oferta

- Landing: `src/app/page.tsx` (hero, recursos, preços, CTA)
- Tabela placeholder: mesma página + seção no README
- Labels da UI já estão em pt-BR — revise tom (formal vs. direto)

## Auth e demo

- Credenciais demo: `prisma/seed.ts` e menções no README / login
- Regras de senha: `src/lib/actions.ts` (`registerUser`)
- Páginas de login: `src/app/login`, `src/app/registro`
- Segredo JWT: `NEXTAUTH_SECRET` no ambiente — nunca commitar o de produção

## Dados

Modelos em `prisma/schema.prisma`. Para um produto irmão:

1. Renomeie `Proposal` / `ProposalItem` (ex.: `Receipt`, `Contract`)
2. Ajuste o formulário e o PDF
3. Rode `npx prisma db push` (dev) ou uma migration (prod)

Valores monetários estão em `Float` (reais). Em produção séria, prefira centavos inteiros ou `Decimal` no Postgres.

## Banco

Dev = SQLite. Produção = Postgres. O schema já traz o bloco comentado. Depois da troca:

```bash
npx prisma migrate dev --name postgres
```

## Deploy da marca

Checklist mínimo:

- [ ] Nome, cores, fontes
- [ ] `NEXTAUTH_URL` no domínio real
- [ ] `NEXTAUTH_SECRET` novo
- [ ] Postgres + backup
- [ ] Seed demo desligada (ou usuário interno)
- [ ] CTA de personalização com canal verdadeiro
- [ ] Prints em `screenshots/`
