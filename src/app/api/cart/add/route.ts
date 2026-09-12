import { NextRequest, NextResponse } from "next/server";
import { addToCart } from "@/lib/wpgraphql/cart";

export async function POST(request: NextRequest) {
  const sessionToken = request.headers.get("X-Cart-Session");
  const { productId, quantity, variationId } = await request.json();

  try {
    const { cart, sessionToken: nextToken } = await addToCart(
      productId,
      quantity ?? 1,
      sessionToken,
      variationId
    );
    return NextResponse.json({ cart, sessionToken: nextToken });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
