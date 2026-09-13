import { AppShell } from "@/components/app-shell";
import { requireUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await requireUser();
  return (
    <AppShell userName={user.name ?? "Você"} companyName={user.companyName}>
      {children}
    </AppShell>
  );
}
