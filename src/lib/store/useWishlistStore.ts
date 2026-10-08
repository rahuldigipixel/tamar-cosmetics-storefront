import { create } from "zustand";
import { useAuthStore } from "./useAuthStore";

// Logged-in wishlists live server-side (WP user meta, WoodMart's own
// serialized format — see class-wishlist.php). Guests never hit the
// backend: their wishlist lives entirely in this browser cookie, same
// convention WoodMart itself uses for guests, with a 30-day expiry.
const GUEST_COOKIE_NAME = "tamar_wishlist";
const GUEST_COOKIE_MAX_AGE_DAYS = 30;

function readGuestCookie(): number[] {
  if (typeof document === "undefined") return [];
  const match = document.cookie.match(new RegExp(`(?:^|; )${GUEST_COOKIE_NAME}=([^;]*)`));
  if (!match) return [];
  try {
    const ids = JSON.parse(decodeURIComponent(match[1]));
    return Array.isArray(ids) ? ids.filter((id): id is number => typeof id === "number") : [];
  } catch {
    return [];
  }
}

function writeGuestCookie(ids: number[]) {
  if (typeof document === "undefined") return;
  const maxAge = GUEST_COOKIE_MAX_AGE_DAYS * 24 * 60 * 60;
  document.cookie = `${GUEST_COOKIE_NAME}=${encodeURIComponent(JSON.stringify(ids))}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

function clearGuestCookie() {
  if (typeof document === "undefined") return;
  document.cookie = `${GUEST_COOKIE_NAME}=; path=/; max-age=0`;
}

interface WishlistState {
  productIds: number[];
  hydrated: boolean;
  fetchWishlist: () => Promise<void>;
  toggle: (productId: number) => Promise<void>;
  has: (productId: number) => boolean;
  /** Called on login: folds any guest-cookie items into the account's server wishlist, then clears the cookie. */
  mergeGuestIntoAccount: () => Promise<void>;
}

// Header, every product card and the gallery all call fetchWishlist() on
// mount in the same tick; `hydrated` only flips once the response lands, so
// without sharing the in-flight promise a grid page fired one /api/wishlist
// request per card.
let wishlistRequest: Promise<void> | null = null;

export const useWishlistStore = create<WishlistState>()((set, get) => ({
  productIds: [],
  hydrated: false,

  fetchWishlist: async () => {
    if (get().hydrated) return;
    if (wishlistRequest) return wishlistRequest;

    // useAuthStore persists to localStorage and rehydrates asynchronously —
    // reading its token before that finishes would misread a logged-in
    // visitor as a guest (and since `hydrated` only flips once, permanently
    // for this page load). Wait for it first.
    if (useAuthStore.persist && !useAuthStore.persist.hasHydrated()) {
      await new Promise<void>((resolve) => {
        const unsubscribe = useAuthStore.persist.onFinishHydration(() => {
          unsubscribe();
          resolve();
        });
      });
    }

    const token = useAuthStore.getState().token;
    if (!token) {
      set({ productIds: readGuestCookie(), hydrated: true });
      return;
    }

    wishlistRequest = (async () => {
      try {
        const res = await fetch("/api/wishlist/", {
          cache: "no-store",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const items = (await res.json()) as { productId: number }[];
          set({ productIds: items.map((item) => item.productId) });
        }
      } catch {
        // backend unreachable — leave productIds as they were
      } finally {
        set({ hydrated: true });
        wishlistRequest = null;
      }
    })();
    return wishlistRequest;
  },

  toggle: async (productId) => {
    const inList = get().productIds.includes(productId);
    const nextIds = inList ? get().productIds.filter((id) => id !== productId) : [...get().productIds, productId];
    set({ productIds: nextIds });

    const token = useAuthStore.getState().token;
    if (!token) {
      writeGuestCookie(nextIds);
      return;
    }

    try {
      await fetch("/api/wishlist/", {
        method: inList ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ productId }),
      });
    } catch {
      // backend unreachable — local state already reflects the change
    }
  },

  has: (productId) => get().productIds.includes(productId),

  mergeGuestIntoAccount: async () => {
    const guestIds = readGuestCookie();
    const token = useAuthStore.getState().token;
    if (guestIds.length === 0 || !token) return;

    await Promise.all(
      guestIds.map((productId) =>
        fetch("/api/wishlist/", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ productId }),
        }).catch(() => {
          // best-effort — a failed item just stays out of the merged list
        })
      )
    );
    clearGuestCookie();
    set({ hydrated: false });
    await get().fetchWishlist();
  },
}));
