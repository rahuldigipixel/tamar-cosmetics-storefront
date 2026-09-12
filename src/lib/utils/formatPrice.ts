/**
 * `Intl.NumberFormat("he-IL", { style: "currency" })` inserts a regular
 * space between the ₪ symbol and the number, which reads as an oversized
 * gap next to bold price text. Every price display in the storefront wants
 * the symbol set tight against the number instead, so this formats plainly
 * rather than relying on Intl's currency spacing.
 */
export function formatPrice(value: string | number, currency: string = "ILS"): string {
  const numeric = typeof value === "number" ? value : Number(value);
  const amount = (Number.isNaN(numeric) ? 0 : numeric).toFixed(2);
  const symbol = currency === "ILS" ? "₪" : currency;
  return `${symbol}${amount}`;
}
