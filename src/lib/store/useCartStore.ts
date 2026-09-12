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
}

async function cartFetchOnce(
  path: string,
  sessionToken: string | null,
  body?: Record<string, unknown>
): Promise<CartApiResponse> {
  const res = await fetch(path, {
    method: body ? "POST" : "GET",
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
  body?: Record<string, unknown>
): Promise<CartApiResponse> {
  try {
    return await cartFetchOnce(path, sessionToken, body);
  } catch (error) {
    if (sessionToken && (error as Error).message?.includes("invalid_token")) {
      return cartFetchOnce(path, null, body);
    }
    throw error;
  }
}

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
        set({ loading: true });
        try {
          const { cart, sessionToken } = await cartFetch("/api/cart", get().sessionToken);
          set({ cart, sessionToken });
        } finally {
          set({ loading: false });
        }
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
        set({ loading: true });
        try {
          const { cart, sessionToken } = await cartFetch("/api/cart/update", get().sessionToken, {
            items: [{ key, quantity }],
          });
          set({ cart, sessionToken });
        } finally {
          set({ loading: false });
        }
      },

      removeItem: async (key) => {
        set({ loading: true });
        try {
          const { cart, sessionToken } = await cartFetch("/api/cart/remove", get().sessionToken, {
            itemKey: key,
          });
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
