const ENTITIES: Record<string, string> = { quot: '"', amp: "&", lt: "<", gt: ">", apos: "'", nbsp: " " };

/** WooCommerce notices arrive as HTML ("&quot;", <a>…) — turn them into plain text for display. */
export function decodeWcMessage(message: string): string {
  return message
    .replace(/<[^>]*>/g, "")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&(\w+);/g, (m, name) => ENTITIES[name] ?? m)
    .trim();
}
