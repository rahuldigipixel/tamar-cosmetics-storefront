import type { ProductAttribute } from "@/types/product";

export interface UnitPrice {
  /** Full label to show before the price, e.g. `מחיר ל 100 מ"ל:`. */
  label: string;
  value: number;
}

/** PHP's intval(str_replace($unit, '', $name)): the leading integer of what's left, 0 when there is none. */
function leadingInt(name: string, unit: string): number {
  const parsed = parseInt(name.replace(unit, "").trim(), 10);
  return Number.isNaN(parsed) ? 0 : parsed;
}

/**
 * Port of the legacy WordPress `[unit_price]` shortcode (render_unit_price):
 * reads the product's quantity attribute terms (e.g. `13 מ"ל`, `2 ליטר`,
 * `1 ק"ג`, `250 גרם`) and scales the current price to 100 ml, or to 100 g
 * when no volume applies. The volume price wins over the weight price;
 * within one attribute the first term that yields a value wins. `price` is
 * the active price (the sale price while on sale).
 *
 * The legacy code only looked at `pa_contains_quantity`; this store's newer
 * products use a "כמות" attribute (`pa_כמות`), so both are accepted.
 */
export function getUnitPrice(price: number, attributes: ProductAttribute[]): UnitPrice | null {
  if (!price) return null;

  let mlPrice: number | null = null;
  let gramPrice: number | null = null;

  for (const attribute of attributes) {
    const isQuantity = attribute.name === "pa_contains_quantity" || /כמות/.test(`${attribute.label} ${attribute.name}`);
    if (!isQuantity || !attribute.optionNames?.length) continue;

    for (const termName of attribute.optionNames) {
      if (termName.includes('מ"ל')) {
        const ml = leadingInt(termName, 'מ"ל');
        if (ml) {
          mlPrice = (price / ml) * 100;
          break;
        }
      }
      if (termName.includes("ליטר")) {
        const liter = leadingInt(termName, "ליטר");
        if (liter) {
          mlPrice = (price / liter / 1000) * 100;
          break;
        }
      }
      if (termName.includes('ק"ג')) {
        const kg = leadingInt(termName, 'ק"ג');
        if (kg) {
          gramPrice = (price / kg / 1000) * 100;
          break;
        }
      }
      if (termName.includes("גרם")) {
        const gram = leadingInt(termName, "גרם");
        if (gram) {
          gramPrice = (price / gram) * 100;
          break;
        }
      }
    }
  }

  if (mlPrice) return { label: 'מחיר ל 100 מ"ל:', value: mlPrice };
  if (gramPrice) return { label: "מחיר ל-100 גרם:", value: gramPrice };
  return null;
}
