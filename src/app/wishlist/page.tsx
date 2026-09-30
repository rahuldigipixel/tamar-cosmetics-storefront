import { WishlistView } from "@/components/wishlist/WishlistView";

// Public URL is "/רשימת-משאלות" (rewrite in next.config.ts) — same
// non-ASCII-directory limitation as /brand-list for "/מותג/".
export default function WishlistPage() {
  return <WishlistView />;
}
