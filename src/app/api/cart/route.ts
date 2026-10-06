import { NextRequest, NextResponse } from "next/server";
import { getCart, getCheckoutCart } from "@/lib/wpgraphql/cart";

export async function GET(request: NextRequest) {
  const sessionToken = request.headers.get("X-Cart-Session");
  try {
    // ?gateways=1 (the checkout page) adds the payment gateways to the same single backend request.
    if (request.nextUrl.searchParams.get("gateways") === "1") {
      const result = await getCheckoutCart(sessionToken);
      return NextResponse.json({ ...result, sessionToken: result.sessionToken });
    }
    const { cart, sessionToken: nextToken, shippingAddress } = await getCart(sessionToken);
    return NextResponse.json({ cart, sessionToken: nextToken, shippingAddress });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 502 });
  }
}
