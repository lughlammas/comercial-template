import { beforeEach, describe, expect, it, vi } from "vitest";

// The PDF route is exercised with a mocked session and Prisma client.
// The real @react-pdf/renderer is used, so the 200 case renders a PDF.
const getServerSession = vi.hoisted(() => vi.fn());
const prisma = vi.hoisted(() => ({ proposal: { findFirst: vi.fn() } }));

vi.mock("next-auth", () => ({ getServerSession }));
vi.mock("@/lib/auth", () => ({ authOptions: {} }));
vi.mock("@/lib/prisma", () => ({ prisma }));

import { GET } from "@/app/api/propostas/[id]/pdf/route";

const call = (id: string) =>
  GET(new Request(`http://localhost/api/propostas/${id}/pdf`), { params: Promise.resolve({ id }) });

beforeEach(() => vi.clearAllMocks());

describe("GET /api/propostas/[id]/pdf", () => {
  it("returns 401 without a session and does not query the database", async () => {
    getServerSession.mockResolvedValue(null);
    const res = await call("p1");
    expect(res.status).toBe(401);
    expect(prisma.proposal.findFirst).not.toHaveBeenCalled();
  });

  it("scopes the lookup to the session user and returns 404 for proposals it does not own", async () => {
    getServerSession.mockResolvedValue({ user: { id: "user-b" } });
    prisma.proposal.findFirst.mockResolvedValue(null);
    const res = await call("p1");
    expect(prisma.proposal.findFirst.mock.calls[0][0].where).toEqual({ id: "p1", userId: "user-b" });
    expect(res.status).toBe(404);
  });

  it("renders a PDF attachment for the owner", async () => {
    getServerSession.mockResolvedValue({ user: { id: "user-a" } });
    prisma.proposal.findFirst.mockResolvedValue({
      id: "p1",
      title: "Website refresh",
      notes: "Synthetic test data",
      createdAt: new Date("2026-10-07T12:00:00Z"),
      status: "rascunho",
      user: { name: "Alex", companyName: "Example Studio" },
      client: { name: "Jordan", company: null, email: null },
      items: [{ description: "Discovery", quantity: 1, unitPrice: 1200 }],
    });
    const res = await call("p1");
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("application/pdf");
    expect(res.headers.get("content-disposition")).toBe('attachment; filename="proposta-p1.pdf"');
    const bytes = Buffer.from(await res.arrayBuffer());
    expect(bytes.subarray(0, 5).toString("latin1")).toBe("%PDF-");
    const pages = bytes.toString("latin1").match(/\/Type\s*\/Page\b/g) ?? [];
    expect(pages).toHaveLength(1);
  }, 20000);
});
