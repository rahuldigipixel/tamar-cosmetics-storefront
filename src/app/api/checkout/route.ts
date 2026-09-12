import { NextRequest, NextResponse } from "next/server";
import { fetchGraphQL } from "@/lib/wpgraphql/client";
import { sessionRequestHeader, readSessionToken } from "@/lib/wpgraphql/session";
import { CHECKOUT } from "@/lib/wpgraphql/mutations/checkout";

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
  appartment: string; // billing_appartment (required)
  city: string; // sent as CustomerAddressInput.state
  country: "IL";
  email?: string;
  phone?: string;
}

export interface CheckoutRequestBody {
  billing_address: IsraeliAddress;
  shipping_address: IsraeliAddress;
  payment_method: "gocredit" | "paypal";
  customer_note?: string;
}

function toCustomerAddressInput(address: IsraeliAddress) {
  return {
    firstName: address.first_name,
    address1: address.address_1,
    state: address.city,
    country: "IL",
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

  try {
    const { data, response } = await fetchGraphQL<{
      checkout: { order: { databaseId: number; status: string }; result: string; redirect: string | null };
    }>(
      CHECKOUT,
      {
        billing: toCustomerAddressInput(payload.billing_address),
        shipping: toCustomerAddressInput(payload.shipping_address),
        paymentMethod: payload.payment_method,
        customerNote: payload.customer_note,
      },
      { cache: "no-store", headers: sessionRequestHeader(sessionToken) }
    );

    return NextResponse.json({
      order_id: data.checkout.order.databaseId,
      status: data.checkout.order.status,
      payment_result: {
        payment_status: data.checkout.result,
        redirect_url: data.checkout.redirect ?? undefined,
      },
      sessionToken: readSessionToken(response) ?? sessionToken,
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
