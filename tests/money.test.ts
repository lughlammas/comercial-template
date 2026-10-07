import { describe, expect, it } from "vitest";
import { formatBRL, lineTotal, sumItems } from "@/lib/money";

// Intl output uses a non-breaking space between "R$" and the amount.
const norm = (s: string) => s.replace(/\s/g, " ");

describe("lineTotal", () => {
  it("multiplies quantity by unit price", () => {
    expect(lineTotal(3, 450.5)).toBe(1351.5);
  });

  it("rounds to cents, avoiding floating-point drift", () => {
    expect(0.1 * 3).not.toBe(0.3);
    expect(lineTotal(3, 0.1)).toBe(0.3);
    expect(lineTotal(1.5, 33.333)).toBe(50);
  });

  it("returns 0 for zero quantity", () => {
    expect(lineTotal(0, 999)).toBe(0);
  });
});

describe("sumItems", () => {
  it("sums rounded line totals", () => {
    expect(
      sumItems([
        { quantity: 1, unitPrice: 1200 },
        { quantity: 3, unitPrice: 450.5 },
      ]),
    ).toBe(2551.5);
  });

  it("returns 0 for an empty list", () => {
    expect(sumItems([])).toBe(0);
  });

  it("matches the seeded demo proposal total (R$ 8.600)", () => {
    expect(
      sumItems([
        { quantity: 1, unitPrice: 2800 },
        { quantity: 1, unitPrice: 4200 },
        { quantity: 1, unitPrice: 1600 },
      ]),
    ).toBe(8600);
  });
});

describe("formatBRL", () => {
  it("formats values as Brazilian reais", () => {
    expect(norm(formatBRL(2551.5))).toBe("R$ 2.551,50");
  });

  it("treats NaN/0 as zero", () => {
    expect(norm(formatBRL(Number.NaN))).toBe("R$ 0,00");
    expect(norm(formatBRL(0))).toBe("R$ 0,00");
  });
});
