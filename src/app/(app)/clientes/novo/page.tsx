import Link from "next/link";
import { ClientForm } from "@/components/client-form";

export default function NewClientPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link href="/clientes" className="text-sm text-muted hover:underline">
          ← Clientes
        </Link>
        <h1 className="mt-2 font-serif text-4xl text-navy">Novo cliente</h1>
      </div>
      <ClientForm />
    </div>
  );
}
