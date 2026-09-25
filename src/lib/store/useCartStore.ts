import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { EMPTY_CART, type Cart } from "@/types/cart";

interface CartApiResponse {
  cart: Cart;
  sessionToken: string | null;
  error?: string;
}

interface CartState {
  cart: Cart;
  sessionToken: string | null;
  loading: boolean;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  fetchCart: () => Promise<void>;
  addItem: (productId: number, quantity?: number, variationId?: number) => Promise<void>;
  updateItemQuantity: (key: string, quantity: number) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
  applyCoupon: (code: string) => Promise<void>;
  removeCoupon: (code: string) => Promise<void>;
  selectShippingMethod: (methodId: string) => Promise<void>;
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

let quantityRequestCounter = 0;
const latestQuantityRequestByKey: Record<string, number> = {};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: EMPTY_CART,
      sessionToken: null,
      loading: false,
      isDrawerOpen: false,
      openDrawer: () => set({ isDrawerOpen: true }),
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
            const { cart, sessionToken } = await cartFetch("/api/cart", get().sessionToken);
            set({ cart, sessionToken });
          } finally {
            set({ loading: false });
            cartRequest = null;
          }
        })();
        return cartRequest;
      },

      addItem: async (productId, quantity = 1, variationId) => {
        set({ loading: true });
        try {
          const { cart, sessionToken } = await cartFetch("/api/cart/add", get().sessionToken, {
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
          const { cart, sessionToken } = await cartFetch("/api/cart/update", get().sessionToken, {
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

      removeItem: async (key) => {
        // Optimistic: drop the item from the visible list immediately
        // instead of waiting on the round trip to the WooCommerce backend —
        // the authoritative cart (correct totals/tax) still replaces this
        // once the request resolves, or gets restored if it fails.
        const previousCart = get().cart;
        const removedItem = previousCart.items.find((i) => i.key === key);
        set({
          cart: {
            ...previousCart,
            items: previousCart.items.filter((i) => i.key !== key),
            itemCount: Math.max(0, previousCart.itemCount - (removedItem?.quantity ?? 0)),
          },
        });

        try {
          const { cart, sessionToken } = await cartFetch("/api/cart/remove", get().sessionToken, {
            itemKey: key,
          });
          set({ cart, sessionToken });
        } catch (error) {
          set({ cart: previousCart });
          throw error;
        }
      },

      applyCoupon: async (code) => {
        set({ loading: true });
        try {
          const { cart, sessionToken } = await cartFetch("/api/cart/coupon", get().sessionToken, { code }, "POST");
          set({ cart, sessionToken });
        } finally {
          set({ loading: false });
        }
      },

      removeCoupon: async (code) => {
        set({ loading: true });
        try {
          const { cart, sessionToken } = await cartFetch(
            "/api/cart/coupon",
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
          const { cart, sessionToken } = await cartFetch("/api/cart/shipping", get().sessionToken, { methodId });
          set({ cart, sessionToken });
        } finally {
          set({ loading: false });
        }
      },
    }),
    {
      name: "tamar-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ cart: state.cart, sessionToken: state.sessionToken }),
    }
  )
);
