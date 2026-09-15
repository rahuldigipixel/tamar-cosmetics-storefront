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
  hydrated: boolean;
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
      hydrated: false,

      ensureId: () => {
        let id = get().wishlistId;
        if (!id) {
          id = randomUUID();
          set({ wishlistId: id });
        }
        return id;
      },

      fetchWishlist: async () => {
        // Only sync from the server once per session — the list already
        // persists locally (localStorage), and this backend endpoint may
        // not be implemented/reachable yet. Re-running this on every card's
        // mount (a grid renders many at once) would both hammer the API
        // and, on a failed/empty response, wipe out items the user just
        // added locally before the server ever confirmed them.
        if (get().hydrated) return;
        const id = get().ensureId();
        try {
          const res = await fetch(`/api/wishlist?wishlist_id=${id}`, { cache: "no-store" });
          if (res.ok) {
            const items = (await res.json()) as { productId: number }[];
            if (Array.isArray(items) && items.length > 0) {
              set((state) => ({
                productIds: Array.from(new Set([...state.productIds, ...items.map((i) => i.productId)])),
              }));
            }
          }
        } catch {
          // backend unreachable — keep whatever is already persisted locally
        } finally {
          set({ hydrated: true });
        }
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
        try {
          await fetch("/api/wishlist", {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ wishlistId: id, productId }),
          });
        } catch {
          // backend unreachable — local state (persisted) already reflects the change
        }
      },

      has: (productId) => get().productIds.includes(productId),
    }),
    {
      name: "tamar-wishlist",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ wishlistId: state.wishlistId, productIds: state.productIds }),
    }
  )
);
