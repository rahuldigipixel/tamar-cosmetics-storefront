import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { getCheckoutNotice } from "@/lib/wpgraphql/checkoutPage";

export const metadata: Metadata = { title: "תשלום" };

// Server shell: the page's one cached backend request (the notice paragraph under the form, from wp-admin).
// Cart, shipping and payment methods are session-specific, so CheckoutForm loads them client-side in a single
// combined request (cart + gateways) — see fetchCheckoutCart in useCartStore.
export default async function CheckoutPage() {
  const notice = await getCheckoutNotice();
  return <CheckoutForm notice={notice} />;
}
