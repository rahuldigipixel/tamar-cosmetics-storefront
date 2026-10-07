export interface City {
  code: string;
  name: string;
}

// Snapshot of WooCommerce's Israeli "states" (the "Cities Shipping Zones for WooCommerce" plugin's city
// list: code like IL3000 = Jerusalem → name). Shipping zones match on the code, so the cart/checkout send
// it as the shipping state. Bundled as a lazily imported chunk so picking a city needs no backend request
// at all. If cities are added in wp-admin, regenerate israelCities.json from /wp-json/tamar/v1/shipping-cities.
let cached: Promise<City[]> | null = null;

export function loadShippingCities(): Promise<City[]> {
  cached ??= import("./israelCities.json").then((m) =>
    (m.default as [string, string][]).map(([code, name]) => ({ code, name }))
  );
  return cached;
}
