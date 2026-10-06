export interface CartItem {
  key: string;
  quantity: number;
  total: string;
  subtotal: string;
  /** Unit regular (pre-sale) price, raw number string. */
  regularPrice?: string;
  product: {
    id: string;
    databaseId: number;
    slug: string;
    name: string;
    sku?: string;
    categories: { slug: string }[];
    image?: { src: string; alt: string };
  };
  variation?: {
    id: string;
    databaseId: number;
    name: string;
  };
}

export interface ShippingRate {
  id: string;
  label: string;
  cost: string;
}

export interface ShippingAddress {
  /** WooCommerce state code — for Israel this is the city code (e.g. "IL3000"), which drives shipping-zone rules. */
  state: string;
  city: string;
}

/** An enabled WooCommerce payment gateway (title/description/logo exactly as set in wp-admin). */
export interface PaymentGateway {
  id: string;
  title: string;
  description: string | null;
  icon: string | null;
}

export interface Cart {
  isEmpty: boolean;
  itemCount: number;
  items: CartItem[];
  appliedCoupons: { code: string; discountAmount: string }[];
  subtotal: string;
  total: string;
  totalTax: string;
  shippingTotal: string;
  discountTotal: string;
  shippingRates: ShippingRate[];
  chosenShippingMethod: string | null;
}

export const EMPTY_CART: Cart = {
  isEmpty: true,
  itemCount: 0,
  items: [],
  appliedCoupons: [],
  subtotal: "0",
  total: "0",
  totalTax: "0",
  shippingTotal: "0",
  discountTotal: "0",
  shippingRates: [],
  chosenShippingMethod: null,
};
