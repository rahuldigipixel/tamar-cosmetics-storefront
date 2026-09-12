import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// crypto.randomUUID() only exists in secure contexts (https, or localhost).
// This app is also browsed over plain http on the LAN dev IP, where the
// method is simply undefined — falls back to crypto.getRandomValues, which
// (unlike randomUUID) is available everywhere the Web Crypto API exists.
function randomUUID(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

interface WishlistState {
  wishlistId: string;
  productIds: number[];
  ensureId: () => string;
  fetchWishlist: () => Promise<void>;
  toggle: (productId: number) => Promise<void>;
  has: (productId: number) => boolean;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      wishlistId: "",
      productIds: [],

      ensureId: () => {
        let id = get().wishlistId;
        if (!id) {
          id = randomUUID();
          set({ wishlistId: id });
        }
        return id;
      },

      fetchWishlist: async () => {
        const id = get().ensureId();
        const res = await fetch(`/api/wishlist?wishlist_id=${id}`, { cache: "no-store" });
        const items = (await res.json()) as { productId: number }[];
        set({ productIds: items.map((i) => i.productId) });
      },

      toggle: async (productId) => {
        const id = get().ensureId();
        const inList = get().productIds.includes(productId);
        const method = inList ? "DELETE" : "POST";
        set({
          productIds: inList
            ? get().productIds.filter((p) => p !== productId)
            : [...get().productIds, productId],
        });
        await fetch("/api/wishlist", {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ wishlistId: id, productId }),
        });
      },

      has: (productId) => get().productIds.includes(productId),
    }),
    {
      name: "tamar-wishlist",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
