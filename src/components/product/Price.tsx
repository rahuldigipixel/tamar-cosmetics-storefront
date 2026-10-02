import { formatPrice } from "@/lib/utils/formatPrice";

// Same stack the legacy site computes on its prices (WhatFont: "Open Sans Hebrew", sans-serif) — approved exception to the one-font rule.
const PRICE_FONT = '"Open Sans Hebrew", sans-serif';

/**
 * Price with the currency symbol at a fixed size; the amount inherits the parent's font size/weight/colour.
 * `symbolSize` (px) and `family` let a place match its reference measurement (e.g. the linked-products slider: 14px, site font).
 */
export function Price({
  value,
  currency = "ILS",
  symbolSize = 40,
  family = PRICE_FONT,
}: {
  value: string | number;
  currency?: string;
  symbolSize?: number;
  family?: string;
}) {
  const text = formatPrice(value, currency);
  const symbolLength = currency === "ILS" ? 1 : currency.length;
  return (
    <span style={{ fontFamily: family }}>
      <span style={{ fontSize: symbolSize }}>{text.slice(0, symbolLength)}</span>
      {text.slice(symbolLength)}
    </span>
  );
}
