import { wpEnv } from "./env";
import type { ProductLabel } from "@/types/product";

const TAMAR_API_BASE = `${wpEnv.wordpressUrl}/wp-json/tamar/v1`;

async function tamarFetch<T>(path: string, options: RequestInit = {}): Promise<T | null> {
  try {
    const res = await fetch(`${TAMAR_API_BASE}${path}`, {
      ...options,
      headers: { "Content-Type": "application/json", ...options.headers },
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    // tamar-headless-api plugin may not be installed/activated yet on this backend.
    return null;
  }
}

export interface WishlistItem {
  productId: number;
}

export function getWishlist(wishlistId: string) {
  return tamarFetch<WishlistItem[]>(`/wishlist?wishlist_id=${encodeURIComponent(wishlistId)}`);
}

export function addToWishlist(wishlistId: string, productId: number) {
  return tamarFetch<WishlistItem[]>(`/wishlist`, {
    method: "POST",
    body: JSON.stringify({ wishlist_id: wishlistId, product_id: productId }),
  });
}

export function removeFromWishlist(wishlistId: string, productId: number) {
  return tamarFetch<WishlistItem[]>(`/wishlist`, {
    method: "DELETE",
    body: JSON.stringify({ wishlist_id: wishlistId, product_id: productId }),
  });
}

/** Stub route on the backend today — returns null until the tabs endpoint is implemented. */
export function getProductTabs(productId: number) {
  return tamarFetch<{ title: string; content: string }[]>(`/product-tabs/${productId}`);
}

/** Stub route on the backend today — returns null until the labels endpoint is implemented. */
export function getProductLabels(productId: number) {
  return tamarFetch<ProductLabel[]>(`/product-labels/${productId}`);
}

export function subscribeBackInStock(productId: number, email: string) {
  return tamarFetch<{ success: boolean }>(`/back-in-stock`, {
    method: "POST",
    body: JSON.stringify({ product_id: productId, email }),
  });
}

export interface ClubSignupInput {
  name: string;
  email: string;
  phone: string;
  birthday?: string;
}

/** Stub route on the backend today — returns null until tamar-headless-api implements it. */
export function subscribeClub(input: ClubSignupInput) {
  return tamarFetch<{ success: boolean }>(`/club-signup`, {
    method: "POST",
    body: JSON.stringify({ name: input.name, email: input.email, phone: input.phone, birthday: input.birthday }),
  });
}
