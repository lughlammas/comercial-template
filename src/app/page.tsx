import Link from "next/link";
import { getSessionUser } from "@/lib/session";

const features = [
  {
    title: "Clientes e propostas",
    body: "Cadastro simples, lista e detalhe. O suficiente para vender — sem CRM inchado.",
  },
  {
    title: "Itens, quantidades e totais",
    body: "Monte o escopo linha a linha. O total em reais é calculado na hora.",
  },
  {
    title: "PDF para enviar",
    body: "Gere um documento limpo, com a sua empresa e os dados do cliente.",
  },
  {
    title: "Auth pronta",
    body: "Registro e login com e-mail e senha (JWT). Painel protegido desde o primeiro commit.",
  },
  {
    title: "Stack conhecida",
    body: "Next.js App Router, TypeScript, Tailwind, Prisma e SQLite — Postgres quando crescer.",
  },
  {
    title: "Feito para clonar",
    body: "O mesmo osso vira recibos, contratos ou orçamentos. Veja o playbook em docs/.",
  },
];

const tiers = [
  {
    name: "Starter",
    price: "R$ 0",
    hint: "Uso interno / 1 usuário",
    items: ["Gerador de propostas", "PDF básico", "SQLite local"],
  },
  {
    name: "Pro",
    price: "R$ 97/mês",
    hint: "Equipe pequena — placeholder",
    items: ["Marca própria", "Até 5 usuários", "Exportações extras"],
    highlight: true,
  },
  {
    name: "Business",
    price: "Sob consulta",
    hint: "White-label e personalização",
    items: ["Domínio e visual sob medida", "Fluxos do seu negócio", "Suporte de implementação"],
  },
];

export default async function HomePage() {
  const user = await getSessionUser();

  return (
    <div className="min-h-full bg-navy-deep text-white">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/" className="font-serif text-2xl tracking-tight">
          Comercial
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <a href="#recursos" className="text-zinc-300 hover:text-white">
            Recursos
          </a>
          <a href="#precos" className="text-zinc-300 hover:text-white">
            Preços
          </a>
          {user ? (
            <Link href="/dashboard" className="btn-accent text-sm">
              Ir ao painel
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-zinc-300 hover:text-white">
                Entrar
              </Link>
              <Link href="/registro" className="btn-accent text-sm">
                Começar
              </Link>
            </>
          )}
        </nav>
      </header>

      <section className="mx-auto grid w-full max-w-6xl gap-12 px-6 pb-24 pt-10 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-accent">
            Template SaaS para micro-ferramentas B2B
          </p>
          <h1 className="mt-4 font-serif text-5xl leading-[1.1] sm:text-6xl">
            Propostas comerciais prontas em minutos.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-zinc-300">
            Base reutilizável para vender serviço com clareza. Este recorte é um
            gerador de propostas — o próximo fork pode ser recibos, contratos ou
            orçamentos.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={user ? "/dashboard" : "/registro"} className="btn-accent">
              {user ? "Abrir o painel" : "Criar conta grátis"}
            </Link>
            <Link href="/login" className="btn-ghost border-white/15 text-white hover:bg-white/5">
              Ver demo
            </Link>
          </div>
          <p className="mt-4 text-sm text-zinc-400">
            Demo de exemplo: demo@comercial.local / demo1234
          </p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl">
          <p className="text-xs uppercase tracking-[0.18em] text-accent">Prévia</p>
          <h2 className="mt-2 font-serif text-2xl">Identidade visual e papelaria</h2>
          <p className="mt-1 text-sm text-zinc-400">Ateliê Norte Ltda · 3 itens</p>
          <div className="mt-6 space-y-3 text-sm">
            {[
              ["Pesquisa e direção de marca", "R$ 2.800"],
              ["Logotipo + variações", "R$ 4.200"],
              ["Papelaria", "R$ 1.600"],
            ].map(([label, price]) => (
              <div
                key={label}
                className="flex items-center justify-between border-b border-white/10 pb-3"
              >
                <span>{label}</span>
                <span className="text-accent">{price}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 flex items-end justify-between">
            <span className="text-zinc-400">Total</span>
            <span className="font-serif text-3xl">R$ 8.600</span>
          </div>
        </div>
      </section>

      <section id="recursos" className="bg-background py-20 text-ink">
        <div className="mx-auto w-full max-w-6xl px-6">
          <p className="text-xs uppercase tracking-[0.22em] text-accent-ink/70">
            O que já vem pronto
          </p>
          <h2 className="mt-2 font-serif text-4xl">O osso de um produto comercial.</h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <article key={feature.title} className="card">
                <h3 className="font-serif text-xl">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{feature.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="precos" className="bg-paper py-20 text-ink">
        <div className="mx-auto w-full max-w-6xl px-6">
          <p className="text-xs uppercase tracking-[0.22em] text-muted">Tabela placeholder</p>
          <h2 className="mt-2 font-serif text-4xl">Preços de exemplo — ajuste à sua oferta.</h2>
          <p className="mt-3 max-w-2xl text-muted">
            Números ilustrativos. Troque valores, limites e nomes no README e nesta
            seção. Nada aqui é cobrança real.
          </p>
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {tiers.map((tier) => (
              <article
                key={tier.name}
                className={`rounded-2xl border p-6 ${
                  tier.highlight
                    ? "border-accent bg-navy text-white shadow-lg"
                    : "border-line bg-background"
                }`}
              >
                <p className={`text-sm ${tier.highlight ? "text-accent" : "text-muted"}`}>
                  {tier.name}
                </p>
                <p className="mt-2 font-serif text-3xl">{tier.price}</p>
                <p className={`mt-1 text-sm ${tier.highlight ? "text-zinc-300" : "text-muted"}`}>
                  {tier.hint}
                </p>
                <ul className="mt-6 space-y-2 text-sm">
                  {tier.items.map((item) => (
                    <li key={item}>· {item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="personalizacao" className="bg-navy py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="text-xs uppercase tracking-[0.22em] text-accent">Personalização</p>
          <h2 className="mt-3 font-serif text-4xl">
            Quer a sua marca, o seu domínio e um fluxo sob medida?
          </h2>
          <p className="mt-4 text-zinc-300">
            Este repositório é a base. Clonamos para recibos, contratos, orçamentos
            ou o micro-SaaS do seu escritório — com identidade, textos e regras
            suas.
          </p>
          <a
            href="mailto:contato@exemplo.local?subject=Personaliza%C3%A7%C3%A3o%20Comercial"
            className="btn-accent mt-8"
          >
            Falar sobre personalização
          </a>
        </div>
      </section>

      <footer className="border-t border-white/10 px-6 py-8 text-center text-sm text-zinc-500">
        Comercial template · uso interno e forks · dados de demo são exemplo
      </footer>
    </div>
  );
}
