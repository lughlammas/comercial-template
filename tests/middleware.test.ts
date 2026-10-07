import { describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const getToken = vi.hoisted(() => vi.fn());
vi.mock("next-auth/jwt", () => ({ getToken }));

import { config, middleware } from "@/middleware";

describe("auth middleware", () => {
  it("redirects anonymous requests to /login with a callbackUrl", async () => {
    getToken.mockResolvedValue(null);
    const res = await middleware(new NextRequest("http://localhost/propostas/abc"));
    expect(res.status).toBe(307);
    const location = new URL(res.headers.get("location")!);
    expect(location.pathname).toBe("/login");
    expect(location.searchParams.get("callbackUrl")).toBe("/propostas/abc");
  });

  it("lets requests with a session token through", async () => {
    getToken.mockResolvedValue({ id: "user-a" });
    const res = await middleware(new NextRequest("http://localhost/dashboard"));
    expect(res.headers.get("location")).toBeNull();
    expect(res.headers.get("x-middleware-next")).toBe("1");
  });

  it("protects the dashboard, client and proposal routes", () => {
    for (const path of ["/dashboard", "/clientes/:path*", "/propostas/:path*"]) {
      expect(config.matcher).toContain(path);
    }
  });
});
