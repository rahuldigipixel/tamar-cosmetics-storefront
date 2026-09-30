const STATUS_HE: Record<string, string> = {
  pending: "ממתין לתשלום",
  processing: "בטיפול",
  "on-hold": "בהמתנה",
  completed: "הושלמה",
  cancelled: "בוטלה",
  refunded: "זוכתה",
  failed: "נכשלה",
};

/** Hebrew label for a WooCommerce order status slug, falling back to the backend's own label. */
export function orderStatusLabel(status: string, fallback: string): string {
  return STATUS_HE[status] ?? fallback;
}
