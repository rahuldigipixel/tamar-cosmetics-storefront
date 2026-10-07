import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { getCheckoutPage } from "@/lib/wpgraphql/checkoutPage";

export const metadata: Metadata = { title: "תשלום" };

// Server shell: the page's one cached backend request (the notice paragraph under the form + the terms popup
// message, from wp-admin). Cart, shipping and payment methods are session-specific, so CheckoutForm loads them
// client-side in a single combined request (cart + gateways) — see fetchCheckoutCart in useCartStore. The terms
// text (~25 KB) is fetched lazily from /api/terms only when the shopper opens it.
export default async function CheckoutPage() {
  const { notice, popupMessage } = await getCheckoutPage();
  return <CheckoutForm notice={notice} popupMessage={popupMessage} />;
}
