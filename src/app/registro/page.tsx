import Link from "next/link";
import { RegisterForm } from "@/components/register-form";

export default function RegisterPage() {
  return (
    <div className="flex min-h-full items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <Link href="/" className="font-serif text-3xl text-navy">
          Comercial
        </Link>
        <h1 className="mt-6 font-serif text-3xl">Criar conta</h1>
        <p className="mt-2 text-sm text-muted">
          Para testar rápido, use a demo: demo@comercial.local / demo1234
        </p>
        <div className="mt-6">
          <RegisterForm />
        </div>
        <p className="mt-4 text-sm text-muted">
          Já tem conta?{" "}
          <Link href="/login" className="text-navy underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
