import Link from "next/link";
import { SignOutButton } from "@/components/sign-out-button";

const nav = [
  { href: "/dashboard", label: "Painel" },
  { href: "/clientes", label: "Clientes" },
  { href: "/propostas", label: "Propostas" },
];

export function AppShell({
  userName,
  companyName,
  children,
}: {
  userName: string;
  companyName?: string | null;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-full bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-white/5 bg-navy-deep px-5 py-6 text-white lg:flex">
        <Link href="/dashboard" className="font-serif text-2xl tracking-tight">
          Comercial
        </Link>
        <p className="mt-1 text-xs uppercase tracking-[0.18em] text-accent">
          {companyName || "Sua empresa"}
        </p>
        <nav className="mt-10 flex flex-col gap-1">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm text-zinc-300 transition hover:bg-white/5 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto border-t border-white/10 pt-4">
          <p className="text-sm text-white">{userName}</p>
          <SignOutButton />
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="flex items-center justify-between border-b border-line bg-paper px-4 py-3 lg:hidden">
          <Link href="/dashboard" className="font-serif text-xl">
            Comercial
          </Link>
          <nav className="flex gap-4 text-sm">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} className="text-muted hover:text-ink">
                {item.label}
              </Link>
            ))}
            <SignOutButton />
          </nav>
        </header>
        <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-8">{children}</main>
      </div>
    </div>
  );
}
