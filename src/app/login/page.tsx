import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-full items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <Link href="/" className="font-serif text-3xl text-navy">
          Comercial
        </Link>
        <h1 className="mt-6 font-serif text-3xl">Entrar</h1>
        <p className="mt-2 text-sm text-muted">
          Use a conta demo ou a que você criou no registro.
        </p>
        <div className="mt-6">
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
        <p className="mt-4 text-sm text-muted">
          Não tem conta?{" "}
          <Link href="/registro" className="text-navy underline">
            Criar conta
          </Link>
        </p>
      </div>
    </div>
  );
}
