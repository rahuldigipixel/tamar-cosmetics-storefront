import { NextRequest, NextResponse } from "next/server";
import { getCart } from "@/lib/wpgraphql/cart";

export async function GET(request: NextRequest) {
  const sessionToken = request.headers.get("X-Cart-Session");
  try {
    const { cart, sessionToken: nextToken } = await getCart(sessionToken);
    return NextResponse.json({ cart, sessionToken: nextToken });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 502 });
  }
}
