import { NextRequest, NextResponse } from "next/server";
import { fetchGraphQL } from "@/lib/wpgraphql/client";
import { sessionRequestHeader, readSessionToken } from "@/lib/wpgraphql/session";
import { CHECKOUT } from "@/lib/wpgraphql/mutations/checkout";
import type { GoCreditPaymentType } from "@/lib/wpgraphql/checkoutPage";

const GOCREDIT_GATEWAY_ID = "gocredit_payment";
const GOCREDIT_PAYMENT_TYPES: GoCreditPaymentType[] = ["creditcard", "paypal"];

/**
 * Mirrors the live checkout's actual field set (see wps-woo-extended's
 * `custom_override_checkout_fields`): no last name or postcode field, city is
 * collected as free text and sent through CustomerAddressInput's `state` slot
 * ("Cities Shipping Zones for WooCommerce" repurposes billing_state), and
 * `appartment` is required — exposed on CustomerAddressInput by the
 * tamar-graphql-checkout plugin.
 */
export interface IsraeliAddress {
  first_name: string;
  address_1: string; // street name (billing_address_1)
  address_2?: string; // building (billing_address_2, optional)
  appartment: string; // billing_appartment (required)
  /** City code (e.g. "IL3000") from the shipping-cities list — what shipping zones match on; sent as CustomerAddressInput.state. */
  state: string;
  /** City display name. */
  city: string;
  country: "IL";
  email?: string;
  phone?: string;
}

export interface CheckoutRequestBody {
  billing_address: IsraeliAddress;
  shipping_address: IsraeliAddress;
  /** Gateway id as returned by WooCommerce (e.g. "gocredit_payment", "cod"). */
  payment_method: string;
  /** GoCredit only: which GoCredit payment page to open — credit card (shown in an iframe) or PayPal (redirect). */
  payment_type?: GoCreditPaymentType;
  customer_note?: string;
  /** Flashy "agree to promotional emails/SMS" checkbox — stored as the same order meta the classic checkout writes. */
  accept_marketing?: boolean;
}

function toCustomerAddressInput(address: IsraeliAddress) {
  return {
    firstName: address.first_name,
    address1: address.address_1,
    state: address.state,
    city: address.city,
    country: "IL",
    address2: address.address_2 || undefined,
    email: address.email,
    phone: address.phone,
    appartment: address.appartment,
  };
}

export async function POST(request: NextRequest) {
  const sessionToken = request.headers.get("X-Cart-Session");
  const payload = (await request.json()) as CheckoutRequestBody;

  if (!payload.billing_address.appartment) {
    return NextResponse.json({ error: "מספר דירה הינו שדה חובה" }, { status: 400 });
  }
  if (!payload.payment_method) {
    return NextResponse.json({ error: "יש לבחור אמצעי תשלום" }, { status: 400 });
  }

  const metaData = [{ key: "flashy_accept_marketing", value: payload.accept_marketing ? "1" : "0" }];
  if (payload.payment_method === GOCREDIT_GATEWAY_ID) {
    if (!payload.payment_type || !GOCREDIT_PAYMENT_TYPES.includes(payload.payment_type)) {
      return NextResponse.json({ error: "יש לבחור אמצעי תשלום" }, { status: 400 });
    }
    // The GoCredit gateway's process_payment() sees these, creates the payment request and returns its URL as
    // `redirect`; tamar-headless-api validates them and sends GoCredit's return links back to this storefront.
    metaData.push(
      { key: "generate_request", value: "yes" },
      { key: "payment_type", value: payload.payment_type },
      { key: "tamar_return_base", value: request.nextUrl.origin }
    );
  }

  try {
    const { data, response } = await fetchGraphQL<{
      checkout: { order: { databaseId: number; orderKey: string; status: string }; result: string; redirect: string | null };
    }>(
      CHECKOUT,
      {
        billing: toCustomerAddressInput(payload.billing_address),
        shipping: toCustomerAddressInput(payload.shipping_address),
        paymentMethod: payload.payment_method,
        customerNote: payload.customer_note,
        metaData,
      },
      // GoCredit's SOAP payment request runs inside this mutation and can take a few seconds.
      { cache: "no-store", headers: sessionRequestHeader(sessionToken), timeoutMs: 30_000 }
    );

    return NextResponse.json({
      order_id: data.checkout.order.databaseId,
      order_key: data.checkout.order.orderKey,
      status: data.checkout.order.status,
      payment_result: {
        payment_status: data.checkout.result,
        redirect_url: data.checkout.redirect ?? undefined,
      },
      sessionToken: readSessionToken(response) ?? sessionToken,
    });
  } catch (error) {
    const message = (error as Error).message;
    // When GoCredit rejects the payment request, the gateway echoes an HTML error page and exits instead of
    // returning — don't show that markup to the shopper.
    if (message.includes("did not return JSON")) {
      console.error("[checkout] payment gateway error:", message);
      return NextResponse.json({ error: "לא ניתן לפתוח את דף התשלום המאובטח כרגע. נסו שוב." }, { status: 502 });
    }
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
