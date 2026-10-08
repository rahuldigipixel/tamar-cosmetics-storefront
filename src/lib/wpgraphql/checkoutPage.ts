import { cache } from "react";
import { fetchGraphQLSafe } from "./client";

// One query: the page's paragraph + the checkout popup option (plugin field `tamarCheckoutSettings`) + GoCredit's
// enabled payment methods (plugin field `tamarGoCreditSettings`).
const GET_CHECKOUT_PAGE = /* GraphQL */ `
  query GetCheckoutPage {
    page(id: "checkout", idType: URI) {
      content
    }
    tamarCheckoutSettings {
      noticePopupMessage
    }
    tamarGoCreditSettings {
      paymentMethods
    }
  }
`;

const decodeEntities = (s: string) =>
  s
    .replace(/&quot;|&#0?34;|&#8221;|&#8220;/g, '"')
    .replace(/&#0?39;|&#8217;|&#8216;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");

/** GoCredit `payment_type` values — what the gateway's CreatePaymentRequest() accepts. */
export type GoCreditPaymentType = "creditcard" | "paypal";

/** GoCredit's "Enabled methods" setting (`credit_card` | `paypal` | `both`) as the payment options to show. */
function toGoCreditMethods(setting: string | null | undefined): GoCreditPaymentType[] {
  if (setting === "credit_card") return ["creditcard"];
  if (setting === "paypal") return ["paypal"];
  return ["creditcard", "paypal"];
}

export interface CheckoutPageData {
  /** Paragraph shown under the form (wp-admin → Pages → תשלום, an Elementor heading widget). */
  notice: string;
  /** Popup shown when the terms checkbox is ticked (wp-admin checkout notice popup); "" = disabled. */
  popupMessage: string;
  /** Payment options the GoCredit gateway offers (wp-admin → WooCommerce → Payments → GoCredit → Enabled methods). */
  goCreditMethods: GoCreditPaymentType[];
}

/**
 * Everything the checkout shell needs from WordPress, in one cached request (`revalidate` + tag) — the page's
 * single backend call besides the shared global-data. Returned as plain text so nothing from the page
 * builder's markup/CSS leaks into the storefront.
 */
export const getCheckoutPage = cache(async function getCheckoutPage(): Promise<CheckoutPageData> {
  const data = await fetchGraphQLSafe<{
    page: { content: string | null } | null;
    tamarCheckoutSettings: { noticePopupMessage: string | null } | null;
    tamarGoCreditSettings: { paymentMethods: string | null } | null;
  }>(GET_CHECKOUT_PAGE, {}, { revalidate: 300, tags: ["checkout-page"] });
  const html = data?.page?.content ?? "";
  const heading = /<h2[^>]*elementor-heading-title[^>]*>([\s\S]*?)<\/h2>/.exec(html)?.[1] ?? "";
  return {
    notice: decodeEntities(heading.replace(/<[^>]*>/g, "")).trim(),
    popupMessage: (data?.tamarCheckoutSettings?.noticePopupMessage ?? "").trim(),
    goCreditMethods: toGoCreditMethods(data?.tamarGoCreditSettings?.paymentMethods),
  };
});
