import { beforeEach, describe, expect, it, vi } from "vitest";

// Server actions are tested with Prisma, the session helper and Next.js
// navigation/cache functions replaced by mocks. No database is used.
const prisma = vi.hoisted(() => ({
  user: { findUnique: vi.fn(), create: vi.fn() },
  client: { create: vi.fn(), findFirst: vi.fn() },
  proposal: { create: vi.fn() },
}));
const requireUser = vi.hoisted(() => vi.fn());
const redirect = vi.hoisted(() =>
  vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
);

vi.mock("@/lib/prisma", () => ({ prisma }));
vi.mock("@/lib/session", () => ({ requireUser }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect }));

import { createClient, createProposal, registerUser } from "@/lib/actions";

function form(values: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) data.set(key, value);
  return data;
}

beforeEach(() => {
  vi.clearAllMocks();
  requireUser.mockResolvedValue({ id: "user-a", name: "A" });
});

describe("registerUser", () => {
  it("rejects passwords shorter than 8 characters", async () => {
    const result = await registerUser(form({ name: "A", email: "a@example.test", password: "short" }));
    expect(result).toHaveProperty("error");
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it("rejects a missing name or email", async () => {
    expect(await registerUser(form({ name: "", email: "a@example.test", password: "longenough" }))).toHaveProperty("error");
    expect(await registerUser(form({ name: "A", email: "  ", password: "longenough" }))).toHaveProperty("error");
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it("rejects an email that is already registered", async () => {
    prisma.user.findUnique.mockResolvedValue({ id: "existing" });
    const result = await registerUser(form({ name: "A", email: "a@example.test", password: "longenough" }));
    expect(result).toHaveProperty("error");
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it("normalises the email, hashes the password and defaults the company name", async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    const result = await registerUser(form({ name: " Ana ", email: " Ana@Example.TEST ", password: "longenough" }));
    expect(result).toEqual({ ok: true });
    const data = prisma.user.create.mock.calls[0][0].data;
    expect(data.email).toBe("ana@example.test");
    expect(data.name).toBe("Ana");
    expect(data.companyName).toBe("Sua Empresa");
    expect(data.passwordHash).not.toBe("longenough");
    expect(data.passwordHash).toMatch(/^\$2[aby]\$10\$/);
  });
});

describe("createClient", () => {
  it("requires a client name", async () => {
    const result = await createClient(form({ name: "   " }));
    expect(result).toHaveProperty("error");
    expect(prisma.client.create).not.toHaveBeenCalled();
  });

  it("stores the client under the signed-in user and converts blanks to null", async () => {
    prisma.client.create.mockResolvedValue({ id: "client-1" });
    await expect(createClient(form({ name: "Jordan", email: "", company: "Bakery" }))).rejects.toThrow(
      "REDIRECT:/clientes/client-1",
    );
    const data = prisma.client.create.mock.calls[0][0].data;
    expect(data.userId).toBe("user-a");
    expect(data.email).toBeNull();
    expect(data.company).toBe("Bakery");
  });
});

describe("createProposal", () => {
  const base = {
    clientId: "client-1",
    title: "Website refresh",
    items: [{ description: "Discovery", quantity: 1, unitPrice: 1200 }],
  };

  it("requires a title and a client", async () => {
    expect(await createProposal({ ...base, title: "  " })).toHaveProperty("error");
    expect(await createProposal({ ...base, clientId: "" })).toHaveProperty("error");
    expect(prisma.proposal.create).not.toHaveBeenCalled();
  });

  it("requires at least one item with a description and positive quantity", async () => {
    const result = await createProposal({
      ...base,
      items: [
        { description: "   ", quantity: 1, unitPrice: 10 },
        { description: "Zero quantity", quantity: 0, unitPrice: 10 },
      ],
    });
    expect(result).toHaveProperty("error");
    expect(prisma.client.findFirst).not.toHaveBeenCalled();
  });

  it("looks the client up scoped to the signed-in user and refuses other users' clients", async () => {
    prisma.client.findFirst.mockResolvedValue(null);
    const result = await createProposal(base);
    expect(prisma.client.findFirst).toHaveBeenCalledWith({ where: { id: "client-1", userId: "user-a" } });
    expect(result).toHaveProperty("error");
    expect(prisma.proposal.create).not.toHaveBeenCalled();
  });

  it("creates a draft owned by the user with only valid, trimmed items", async () => {
    prisma.client.findFirst.mockResolvedValue({ id: "client-1", userId: "user-a" });
    prisma.proposal.create.mockResolvedValue({ id: "proposal-1" });
    await expect(
      createProposal({
        ...base,
        notes: "  ",
        items: [
          { description: " Discovery ", quantity: 1, unitPrice: 1200 },
          { description: "", quantity: 2, unitPrice: 5 },
          { description: "Templates", quantity: 3, unitPrice: Number.NaN },
        ],
      }),
    ).rejects.toThrow("REDIRECT:/propostas/proposal-1");
    const data = prisma.proposal.create.mock.calls[0][0].data;
    expect(data.userId).toBe("user-a");
    expect(data.status).toBe("rascunho");
    expect(data.notes).toBeNull();
    expect(data.items.create).toEqual([
      { description: "Discovery", quantity: 1, unitPrice: 1200 },
      { description: "Templates", quantity: 3, unitPrice: 0 },
    ]);
  });
});
