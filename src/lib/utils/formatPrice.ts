/**
 * `Intl.NumberFormat("he-IL", { style: "currency" })` inserts a regular
 * space between the ₪ symbol and the number, which reads as an oversized
 * gap next to bold price text. Every price display in the storefront wants
 * the symbol set tight against the number instead, so this formats plainly
 * rather than relying on Intl's currency spacing.
 */
/**
 * True when a product has no real price (0, empty or unparseable) — such products can't be bought, so every cart
 * button disables itself. Call it with the product's REGULAR price, never the final one: a YITH rule ("buy 1 get 1
 * free") can make the final price 0 on a product that is meant to be bought. Reads the first number in the string (a variable product's range "0 - 20" starts at its
 * lowest price, like WC's get_price()); HTML entities (e.g. `&#8362;`) are dropped first so they aren't read as digits.
 */
export function isZeroPrice(price: string | number | null | undefined): boolean {
  if (typeof price === "number") return !(price > 0);
  const match = String(price ?? "").replace(/&#?\w+;/g, "").replace(/,/g, "").match(/\d+(?:\.\d+)?/);
  return !match || Number(match[0]) <= 0;
}

export function formatPrice(value: string | number, currency: string = "ILS"): string {
  const numeric = typeof value === "number" ? value : Number(value);
  const amount = (Number.isNaN(numeric) ? 0 : numeric).toFixed(2);
  const symbol = currency === "ILS" ? "₪" : currency;
  return `${symbol}${amount}`;
}
