import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { EMPTY_CART, type Cart, type PaymentGateway, type ShippingAddress } from "@/types/cart";

interface CartApiResponse {
  cart: Cart;
  sessionToken: string | null;
  shippingAddress?: ShippingAddress | null;
  paymentGateways?: PaymentGateway[];
  error?: string;
}

interface CartState {
  cart: Cart;
  sessionToken: string | null;
  /** The customer's shipping destination (drives which shipping methods WooCommerce offers). */
  shippingAddress: ShippingAddress | null;
  /** Payment gateways WooCommerce offers for this session — only filled by fetchCheckoutCart (not persisted). */
  paymentGateways: PaymentGateway[];
  /** True once the checkout page's one combined request (cart + gateways) has finished (or was skipped: no session). */
  checkoutReady: boolean;
  loading: boolean;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  fetchCart: () => Promise<void>;
  /** /checkout: cart + payment gateways in one request. */
  fetchCheckoutCart: () => Promise<void>;
  /** After a successful order the server cart is gone — drop the persisted copy too. */
  clearCart: () => void;
  addItem: (productId: number, quantity?: number, variationId?: number) => Promise<void>;
  updateItemQuantity: (key: string, quantity: number) => Promise<void>;
  /** Applies several quantity changes in one request (the cart page's "update cart" button). */
  updateItemQuantities: (items: { key: string; quantity: number }[]) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
  applyCoupon: (code: string) => Promise<void>;
  removeCoupon: (code: string) => Promise<void>;
  selectShippingMethod: (methodId: string) => Promise<void>;
  changeShippingAddress: (state: string, city: string) => Promise<void>;
}

async function cartFetchOnce(
  path: string,
  sessionToken: string | null,
  body?: Record<string, unknown>,
  method?: "GET" | "POST" | "DELETE"
): Promise<CartApiResponse> {
  const res = await fetch(path, {
    method: method ?? (body ? "POST" : "GET"),
    headers: {
      "Content-Type": "application/json",
      ...(sessionToken ? { "X-Cart-Session": sessionToken } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  const data = (await res.json()) as CartApiResponse;
  if (!res.ok) throw new Error(data.error ?? `Cart request to ${path} failed`);
  return data;
}

// A previously-issued session token becomes invalid if the backend rotates
// its signing secret or the session expires server-side — retry once with
// no token (starting a fresh session) instead of leaving the cart stuck
// erroring on every request until the user manually clears storage.
async function cartFetch(
  path: string,
  sessionToken: string | null,
  body?: Record<string, unknown>,
  method?: "GET" | "POST" | "DELETE"
): Promise<CartApiResponse> {
  try {
    return await cartFetchOnce(path, sessionToken, body, method);
  } catch (error) {
    if (sessionToken && (error as Error).message?.includes("invalid_token")) {
      return cartFetchOnce(path, null, body, method);
    }
    throw error;
  }
}

// Concurrency guards for optimistic quantity updates: rapid +/- clicks each
// fire their own request, and responses can arrive out of order. Only the
// response for the most recently issued request per item key is allowed to
// overwrite state, so a slow earlier response can't clobber a newer click.
let cartRequest: Promise<void> | null = null;

// Same idea for removals: a GetCart that was already in flight (drawer open) or
// an earlier remove's response can still list an item the visitor just removed,
// making it reappear and vanish again. Keys with a pending removal are hidden
// from any server cart, and a fetch that began before a removal is discarded.
const pendingRemovals = new Set<string>();
let cartMutationEpoch = 0;

function withoutPendingRemovals(cart: Cart): Cart {
  if (pendingRemovals.size === 0) return cart;
  const items = cart.items.filter((i) => !pendingRemovals.has(i.key));
  return items.length === cart.items.length ? cart : { ...cart, items };
}

let quantityRequestCounter = 0;
const latestQuantityRequestByKey: Record<string, number> = {};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: EMPTY_CART,
      sessionToken: null,
      shippingAddress: null,
      paymentGateways: [],
      checkoutReady: false,
      loading: false,
      isDrawerOpen: false,
      // The persisted cart already drives the header badge, so the server round trip
      // (GetCart) is deferred until the visitor actually opens the drawer or /cart.
      openDrawer: () => {
        set({ isDrawerOpen: true });
        void get().fetchCart();
      },
      closeDrawer: () => set({ isDrawerOpen: false }),

      fetchCart: async () => {
        // Header (root layout) and the /cart or /checkout page both call
        // this on mount — share one in-flight request instead of two.
        if (cartRequest) return cartRequest;
        // No WooCommerce session yet (new visitor, nothing added) — the
        // server can only answer "empty cart", so skip the ~1s round trip.
        // The first addItem() creates the session and returns the cart.
        if (!get().sessionToken) return;
        set({ loading: true });
        cartRequest = (async () => {
          try {
            const epoch = cartMutationEpoch;
            const { cart, sessionToken, shippingAddress } = await cartFetch("/api/cart/", get().sessionToken);
            if (epoch === cartMutationEpoch) {
              set({ cart: withoutPendingRemovals(cart), sessionToken, shippingAddress: shippingAddress ?? null });
            }
          } finally {
            set({ loading: false });
            cartRequest = null;
          }
        })();
        return cartRequest;
      },

      fetchCheckoutCart: async () => {
        if (!get().sessionToken) {
          set({ checkoutReady: true });
          return;
        }
        try {
          const { cart, sessionToken, shippingAddress, paymentGateways } = await cartFetch(
            "/api/cart/?gateways=1",
            get().sessionToken
          );
          set({ cart, sessionToken, shippingAddress: shippingAddress ?? null, paymentGateways: paymentGateways ?? [] });
        } finally {
          set({ checkoutReady: true });
        }
      },

      clearCart: () => set({ cart: EMPTY_CART, paymentGateways: [] }),

      addItem: async (productId, quantity = 1, variationId) => {
        set({ loading: true });
        try {
          const { cart, sessionToken } = await cartFetch("/api/cart/add/", get().sessionToken, {
            productId,
            quantity,
            variationId,
          });
          set({ cart, sessionToken, isDrawerOpen: true });
        } finally {
          set({ loading: false });
        }
      },

      updateItemQuantity: async (key, quantity) => {
        // Optimistic: reflect the new quantity (and its proportional
        // subtotal/total) immediately instead of waiting on the round trip
        // to the WooCommerce backend — rapid +/- clicks used to feel stuck
        // because each click waited on the previous request's response
        // before the UI would move again.
        const previousCart = get().cart;
        const item = previousCart.items.find((i) => i.key === key);
        if (!item) return;

        const unitSubtotal = item.quantity > 0 ? Number(item.subtotal) / item.quantity : 0;
        const unitTotal = item.quantity > 0 ? Number(item.total) / item.quantity : 0;
        const qtyDelta = quantity - item.quantity;

        set({
          cart: {
            ...previousCart,
            items: previousCart.items.map((i) =>
              i.key === key
                ? {
                    ...i,
                    quantity,
                    subtotal: (unitSubtotal * quantity).toFixed(2),
                    total: (unitTotal * quantity).toFixed(2),
                  }
                : i
            ),
            itemCount: Math.max(0, previousCart.itemCount + qtyDelta),
          },
        });

        const requestId = ++quantityRequestCounter;
        latestQuantityRequestByKey[key] = requestId;

        try {
          const { cart, sessionToken } = await cartFetch("/api/cart/update/", get().sessionToken, {
            items: [{ key, quantity }],
          });
          if (latestQuantityRequestByKey[key] === requestId) {
            set({ cart, sessionToken });
          }
        } catch (error) {
          if (latestQuantityRequestByKey[key] === requestId) {
            set({ cart: previousCart });
          }
          throw error;
        }
      },

      updateItemQuantities: async (items) => {
        set({ loading: true });
        try {
          const { cart, sessionToken } = await cartFetch("/api/cart/update/", get().sessionToken, { items });
          set({ cart, sessionToken });
        } finally {
          set({ loading: false });
        }
      },

      removeItem: async (key) => {
        // Optimistic: drop the item from the visible list immediately
        // instead of waiting on the round trip to the WooCommerce backend —
        // the authoritative cart (correct totals/tax) still replaces this
        // once the request resolves, or gets restored if it fails.
        pendingRemovals.add(key);
        cartMutationEpoch++;
        const previousCart = get().cart;
        const removedItem = previousCart.items.find((i) => i.key === key);
        set({
          cart: {
            ...previousCart,
            items: previousCart.items.filter((i) => i.key !== key),
            // Last item gone → the server drops the coupons too; mirror that so nothing stale flashes.
            ...(previousCart.items.length <= 1 ? { appliedCoupons: [], discountTotal: "0" } : {}),
            itemCount: Math.max(0, previousCart.itemCount - (removedItem?.quantity ?? 0)),
          },
        });

        try {
          const { cart, sessionToken } = await cartFetch("/api/cart/remove/", get().sessionToken, {
            itemKey: key,
          });
          pendingRemovals.delete(key);
          cartMutationEpoch++;
          set({ cart: withoutPendingRemovals(cart), sessionToken });
        } catch (error) {
          pendingRemovals.delete(key);
          cartMutationEpoch++;
          set({ cart: previousCart });
          throw error;
        }
      },

      applyCoupon: async (code) => {
        set({ loading: true });
        try {
          const { cart, sessionToken } = await cartFetch("/api/cart/coupon/", get().sessionToken, { code }, "POST");
          set({ cart, sessionToken });
        } finally {
          set({ loading: false });
        }
      },

      removeCoupon: async (code) => {
        set({ loading: true });
        try {
          const { cart, sessionToken } = await cartFetch(
            "/api/cart/coupon/",
            get().sessionToken,
            { code },
            "DELETE"
          );
          set({ cart, sessionToken });
        } finally {
          set({ loading: false });
        }
      },

      selectShippingMethod: async (methodId) => {
        set({ loading: true });
        try {
          const { cart, sessionToken } = await cartFetch("/api/cart/shipping/", get().sessionToken, { methodId });
          set({ cart, sessionToken });
        } finally {
          set({ loading: false });
        }
      },

      changeShippingAddress: async (state, city) => {
        set({ loading: true });
        try {
          const { cart, sessionToken, shippingAddress } = await cartFetch("/api/cart/shipping-address/", get().sessionToken, {
            state,
            city,
          });
          set({ cart, sessionToken, shippingAddress: shippingAddress ?? { state, city } });
        } finally {
          set({ loading: false });
        }
      },
    }),
    {
      name: "tamar-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ cart: state.cart, sessionToken: state.sessionToken, shippingAddress: state.shippingAddress }),
    }
  )
);
