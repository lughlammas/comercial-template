"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className="text-sm text-zinc-400 transition hover:text-white"
    >
      Sair
    </button>
  );
}
