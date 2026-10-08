# Comercial

[![Web validation](https://github.com/lughlammas/comercial-template/actions/workflows/ci.yml/badge.svg)](https://github.com/lughlammas/comercial-template/actions/workflows/ci.yml)

A full-stack Next.js application for client records and commercial proposals, with authentication, user-scoped persistence, item totals, and server-generated PDF downloads.

**Stack:** React, Next.js App Router, TypeScript, Tailwind CSS, NextAuth credentials/JWT, Prisma with SQLite, `@react-pdf/renderer`, and Docker configuration.

**Status:** version 1.0.0 in `package.json`; a demonstration application with a Brazilian Portuguese UI and synthetic seed data. Authentication, persistence and PDF routes are implemented. Vitest unit tests and a browser smoke test are included; no production deployment or adoption is claimed.

By Guilherme Cavalcanti (lughlammas), maintained within **ARBOCK LABS**, an independent software and applied-AI lab currently being structured.

## Implementation

- Email/password registration and login, bcrypt password hashing, and JWT sessions.
- Protected dashboard and client/proposal creation, listing and detail views.
- User-scoped queries and ownership checks for proposal creation and PDF downloads.
- Proposal line items, quantities, prices and totals.
- PDF rendering on the server with `@react-pdf/renderer`.
- Prisma models for `User`, `Client`, `Proposal` and `ProposalItem`.
- Local SQLite setup, sample-data seed and a Dockerfile.

This repository demonstrates application workflows and integration; production security and deployment were not validated in this presentation pass.

## Walkthrough and verification

The [product walkthrough](docs/PRODUCT_WALKTHROUGH.md) covers the architecture, the user flow with [real local screenshots](docs/screenshots/), key source files, how to verify the app, and its current limitations.

```bash
npm run typecheck && npm run lint && npm test   # static checks and 24 unit tests
npm run test:e2e                                # browser smoke test against a running instance
```

The same checks run in [GitHub Actions](.github/workflows/ci.yml) on every push to `main`: install, lint, unit tests, production build, typecheck, and the browser smoke test against the production build.

## Run locally

Use Node.js 20.19+ and npm.

```bash
git clone https://github.com/lughlammas/comercial-template.git
cd comercial-template
cp .env.example .env
npm install
npx prisma db push
npm run seed
npm run dev
```

Configure a locally generated `NEXTAUTH_SECRET` in `.env`, then open [localhost:3000](http://localhost:3000). The seed creates a demo account (`demo@comercial.local`, password `demo1234`) and fictional clients/proposals. These are public example values for local development only; do not deploy the seeded account unchanged.

The seed resets the demo data. Run it only against a database intended for demonstration.

## Build and configuration

```bash
npm run build
npm start
```

`npm run db:push` applies the Prisma schema; `postinstall` generates the Prisma client. See [.env.example](.env.example) for `DATABASE_URL`, `NEXTAUTH_SECRET` and `NEXTAUTH_URL`.

SQLite is the configured database. PostgreSQL is a commented schema alternative, not a separately validated deployment. The [Dockerfile](Dockerfile) provides container configuration; persistent storage and production environment values need to be configured for deployment. No hosted demo or release is currently linked.

## Source map

| Path | Purpose |
|---|---|
| [prisma/schema.prisma](prisma/schema.prisma) | User, client, proposal and item models |
| [prisma/seed.ts](prisma/seed.ts) | Synthetic demo data |
| [src/lib/auth.ts](src/lib/auth.ts) | Credentials authentication and JWT sessions |
| [src/lib/actions.ts](src/lib/actions.ts) | Registration, client and proposal server actions |
| [src/app/(app)/](src/app/%28app%29/) | Protected application pages |
| [src/components/proposal-pdf.tsx](src/components/proposal-pdf.tsx) | PDF layout |
| [PDF route](src/app/api/propostas/%5Bid%5D/pdf/route.tsx) | Authenticated, user-scoped PDF download |

## Customization and development process

[Customization notes](docs/CUSTOMIZATION.md) and the [clone playbook](docs/CLONE_PLAYBOOK.md) describe adapting branding and workflows. The existing landing page contains demonstration pricing and contact placeholders; no billing implementation is claimed.

The project records an AI-assisted development process under human direction across product, implementation, QA and documentation. The repository provides application source, not an executable agent-orchestration platform.

## License

No `LICENSE` file is currently present. Redistribution and commercial-use terms require clarification; this presentation pass does not assign a license.

Maintained by [Guilherme Cavalcanti](https://github.com/lughlammas) · [Portfolio](https://lughlammas.github.io).
