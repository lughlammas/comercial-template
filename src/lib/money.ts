export function formatBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value || 0);
}

export function lineTotal(quantity: number, unitPrice: number): number {
  return Math.round(quantity * unitPrice * 100) / 100;
}

export function sumItems(
  items: { quantity: number; unitPrice: number }[],
): number {
  return items.reduce((acc, item) => acc + lineTotal(item.quantity, item.unitPrice), 0);
}
