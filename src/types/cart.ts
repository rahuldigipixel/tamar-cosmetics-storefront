export interface CartItem {
  key: string;
  quantity: number;
  total: string;
  subtotal: string;
  product: {
    id: string;
    databaseId: number;
    slug: string;
    name: string;
    image?: { src: string; alt: string };
  };
  variation?: {
    id: string;
    databaseId: number;
    name: string;
  };
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
};
