import { NextRequest, NextResponse } from "next/server";
import { changeShippingAddress } from "@/lib/wpgraphql/cart";

export async function POST(request: NextRequest) {
  const sessionToken = request.headers.get("X-Cart-Session");
  const { state, city } = await request.json();

  try {
    const { cart, sessionToken: nextToken, shippingAddress } = await changeShippingAddress(state, city, sessionToken);
    return NextResponse.json({ cart, sessionToken: nextToken, shippingAddress });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
