# Product Walkthrough — Comercial

A reviewer's guide to what this application does, where the behaviour lives in the source, and how to run and verify it yourself.

Everything below was checked against the source in this repository. The run and verification results were observed locally on 2026-10-07 (Linux, Node.js 20.19.2, SQLite, Google Chrome 154 via `playwright-core` 1.64). All data shown in screenshots is synthetic, created by the smoke script during that run. No hosted deployment exists, and none is claimed.

## ARCHITECTURE

A single Next.js App Router application (Next.js 16, React 19, TypeScript). There is no separate backend service: pages are React Server Components that query the database directly, writes go through Server Actions, and one Route Handler streams PDFs.

```text
Browser ──► src/middleware.ts (JWT check on /dashboard, /clientes, /propostas)
              │
              ├─► Server Components in src/app/(app)/…  ──► Prisma ──► SQLite
              ├─► Server Actions in src/lib/actions.ts   ──► Prisma ──► SQLite
              ├─► NextAuth route src/app/api/auth/[...nextauth]/route.ts
              └─► PDF route src/app/api/propostas/[id]/pdf/route.tsx ──► @react-pdf/renderer
```

| Layer | Implementation | Files |
|---|---|---|
| Data model | Prisma models `User`, `Client`, `Proposal`, `ProposalItem`; SQLite datasource; cascading deletes from user | [`prisma/schema.prisma`](../prisma/schema.prisma) |
| Authentication | NextAuth credentials provider, bcrypt password check, JWT session carrying `id` and `companyName` | [`src/lib/auth.ts`](../src/lib/auth.ts), [`src/types/next-auth.d.ts`](../src/types/next-auth.d.ts) |
| Route protection | Middleware redirects requests without a token to `/login?callbackUrl=…`; server pages also call `requireUser()` | [`src/middleware.ts`](../src/middleware.ts), [`src/lib/session.ts`](../src/lib/session.ts) |
| Writes | Server Actions `registerUser`, `createClient`, `createProposal` | [`src/lib/actions.ts`](../src/lib/actions.ts) |
| Reads | Server Components, each query filtered by the session user's id | [`src/app/(app)/`](../src/app/%28app%29/) |
| Money | Line totals rounded to cents, sums, BRL formatting | [`src/lib/money.ts`](../src/lib/money.ts) |
| PDF | Server-side rendering of an A4 proposal document | [`src/components/proposal-pdf.tsx`](../src/components/proposal-pdf.tsx), [PDF route](../src/app/api/propostas/%5Bid%5D/pdf/route.tsx) |
| Packaging | `output: "standalone"` build; multi-stage Dockerfile | [`next.config.ts`](../next.config.ts), [`Dockerfile`](../Dockerfile) |

The user interface is in Brazilian Portuguese (routes `/clientes` = clients, `/propostas` = proposals, `/registro` = sign-up).

## REAL USER FLOW

Each step below was executed in a real browser by [`scripts/e2e-smoke.mjs`](../scripts/e2e-smoke.mjs) against a production build (`npm run build && npm start`). The screenshots in [`docs/screenshots/`](screenshots/) are captures from that run.

1. **Landing page** (`/`): product description, demo credentials and a placeholder pricing table. — [01-landing.png](screenshots/01-landing.png)
2. **Sign-up** (`/registro`): name, company, email and password (minimum 8 characters). On success the user is sent to `/login?registered=1`. — [02-register.png](screenshots/02-register.png)
3. **Login** (`/login`): email/password via NextAuth; success redirects to `/dashboard`. — [03-login.png](screenshots/03-login.png)
4. **Dashboard** (`/dashboard`): client count, recent proposals and their total value for the signed-in user only. — [04-dashboard.png](screenshots/04-dashboard.png)
5. **Create a client** (`/clientes/novo`): saved through `createClient`, then the client detail page opens. The list is at `/clientes`. — [05-clients.png](screenshots/05-clients.png)
6. **Create a proposal** (`/propostas/nova`): choose a client, add line items; the total updates live in the form (1 × 1,200.00 + 3 × 450.50 = R$ 2.551,50 in the captured run). — [06-new-proposal.png](screenshots/06-new-proposal.png)
7. **Proposal detail** (`/propostas/[id]`): persisted items, line totals and grand total. — [07-proposal-detail.png](screenshots/07-proposal-detail.png)
8. **PDF download** (`/api/propostas/[id]/pdf`): returns `application/pdf` as an attachment. — [sample PDF from the run](screenshots/proposal-sample.pdf), [page render](screenshots/08-proposal-pdf.png) (rasterised from that file with `pdftoppm`)

Observed results from the same run (13/13 checks passed):

- Anonymous requests to `/dashboard` are redirected to `/login`; an anonymous PDF request returns `401`.
- The proposal is still listed after logging in again from a fresh browser context, so it is persisted, not held in client state.
- A second registered user does not see the first user's proposal in the list and receives `404` for the first user's proposal page, client page and PDF.

## KEY IMPLEMENTATION AREAS

**Per-user data scoping.** Every read and write is filtered by the session user's id:

- client and proposal lists, detail pages and the dashboard (`where: { userId: user.id }` or `where: { id, userId: user.id }` in `src/app/(app)/*/page.tsx`);
- proposal creation, which re-checks that the chosen client belongs to the user before inserting (`src/lib/actions.ts`, lines 79–84);
- the PDF route, which returns `401` without a session and `404` for proposals the user does not own (`src/app/api/propostas/[id]/pdf/route.tsx`, lines 15–28).

**Input validation in Server Actions** (`src/lib/actions.ts`):

- Registration requires name, email and a password of at least 8 characters. The email is lower-cased, duplicates are rejected and the password is hashed with bcrypt, cost 10.
- A client requires a name.
- A proposal requires a title and a client, plus at least one item with a non-empty description and a positive quantity. Invalid items are dropped, and a missing or invalid unit price becomes 0.

**Money arithmetic** (`src/lib/money.ts`). `lineTotal` rounds each line to cents before summing, so the form, detail page, dashboard and PDF share one calculation. Values are stored as `Float` in Prisma (see limitations).

**PDF generation** (`src/components/proposal-pdf.tsx`). A `@react-pdf/renderer` document is rendered to a buffer on the server, with the seller company, client block, item table, total and notes. It uses built-in Helvetica fonts, so no font files are needed.

**Sessions** (`src/lib/auth.ts`). JWT strategy: the user `id` and `companyName` are copied into the token and exposed on `session.user`, which is typed in `src/types/next-auth.d.ts`.

## HOW TO RUN

Requirements: Node.js 20.19+ and npm. The build downloads Google Fonts via `next/font/google`, so network access is needed at build time.

```bash
git clone https://github.com/lughlammas/comercial-template.git
cd comercial-template
cp .env.example .env          # then replace NEXTAUTH_SECRET with a locally generated value
npm ci                        # also runs `prisma generate`
npx prisma db push            # creates prisma/dev.db (SQLite)
npm run seed                  # optional: demo account and fictional data (resets that account)
npm run dev                   # http://localhost:3000
```

Production-mode build:

```bash
npm run build
npm start
```

`npm start` (`next start`) served the app correctly in the verification run, but Next.js warns that `output: "standalone"` builds are meant to be started with `node .next/standalone/server.js`, which is what the Dockerfile does.

## HOW TO VERIFY

| Command | What it checks | Result on 2026-10-07 |
|---|---|---|
| `npm run typecheck` | TypeScript, `tsc --noEmit` | pass |
| `npm run lint` | ESLint, Next.js core-web-vitals + TypeScript rules | pass (after replacing one `<a>` with `<Link>` in `proposal-form.tsx`) |
| `npm test` | 24 Vitest unit tests in 4 files ([`tests/`](../tests/)) | 24/24 pass |
| `npm run build` | Production build | pass |
| `npm run test:e2e` | Browser smoke test against a running instance ([`scripts/e2e-smoke.mjs`](../scripts/e2e-smoke.mjs)) | 13/13 checks pass |

These checks also run in GitHub Actions ([`.github/workflows/ci.yml`](../.github/workflows/ci.yml)) on every push to `main`. The first run, [#37709036278](https://github.com/lughlammas/comercial-template/actions/runs/37709036278) on commit `c710a4b` with Next.js 16.3.8, passed with 24/24 unit tests and 13/13 browser checks.

Running the browser smoke test:

```bash
npm run build && npm start &                 # or npm run dev
BASE_URL=http://localhost:3000 CHROME_PATH=/usr/bin/google-chrome npm run test:e2e
# optional: SCREENSHOT_DIR=docs/screenshots to regenerate the captures
```

If `CHROME_PATH` is not set, the script uses the Chromium installed by `npx playwright-core install chromium`. It registers two throwaway users with `@example.test` addresses in whatever database the app is using, so point it at a development database.

**What the unit tests cover:**

- `tests/money.test.ts`: line totals, rounding to cents, sums, BRL formatting.
- `tests/actions.test.ts`: registration validation, email normalisation, bcrypt hashing; client name requirement and user ownership; proposal validation, item filtering, and the ownership check that refuses another user's client. Prisma, the session helper and Next.js navigation are mocked.
- `tests/pdf-route.test.tsx`: 401 without a session, the user-scoped lookup that returns 404, and a real one-page PDF rendered for the owner. Session and Prisma are mocked; `@react-pdf/renderer` is real.
- `tests/middleware.test.ts`: anonymous redirect with `callbackUrl`, pass-through with a token, and the protected route list.

**What they do not cover:** React components and form behaviour (covered only by the browser smoke test), NextAuth's own credential flow, Prisma queries against a real database, visual layout, and the PDF's text content beyond structure. There are no performance, accessibility or security tests.

## CURRENT LIMITATIONS

- **No hosted demo or deployment.** Only local runs were verified.
- **Docker image not verified.** Docker was not available in the verification environment. The [`Dockerfile`](../Dockerfile) copies `/app/public`, but the repository has no `public/` directory, so that step is expected to fail until the directory exists or the line is removed.
- **Dependency advisories.** The initial 2026-10-07 audit of `next` 16.3.5 reported 1 critical advisory (GHSA-vcvr-r3jv-pc5j) and 11 high. Next.js was updated to 16.3.8 in commit `0e9e5db`, which clears every `next` advisory. A fresh `npm audit` after that update reports 0 critical and 11 high. These are in lint tooling (`eslint-config-next` and `brace-expansion` chains), the Prisma CLI (`deepmerge-ts`), build-time `source-map-js`, and the optional `sharp` image dependency. The app does not use `next/image`.
- **Feature scope.**
  - Clients and proposals cannot be edited or deleted.
  - Proposal status cannot be changed in the UI; new proposals are always `rascunho` (draft), and only the seed creates other statuses.
  - There is no email verification, password reset or rate limiting on login or registration.
- **Money stored as `Float`.** Rounding happens in `lineTotal`, but amounts are not stored as integer cents or decimals. Currency (BRL) and locale (pt-BR) are hard-coded.
- **Schema management.** It uses `prisma db push`, with no migration history committed. PostgreSQL is only a commented alternative in `schema.prisma` and has not been validated.
- **Demo affordances.**
  - The login form is pre-filled with the public demo credentials.
  - The landing page shows placeholder prices and a placeholder `mailto:` address.
  - In the hero, the secondary "Ver demo" button label renders with almost no contrast (visible in `01-landing.png`).
- **Framework deprecation.** Next.js 16 warns that the `middleware` file convention is deprecated in favour of `proxy`.
- **UI language.** Portuguese only.
