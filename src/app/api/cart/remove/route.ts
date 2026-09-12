import { NextRequest, NextResponse } from "next/server";
import { removeCartItems } from "@/lib/wpgraphql/cart";

export async function POST(request: NextRequest) {
  const sessionToken = request.headers.get("X-Cart-Session");
  const { itemKey } = await request.json();

  try {
    const { cart, sessionToken: nextToken } = await removeCartItems([itemKey], sessionToken);
    return NextResponse.json({ cart, sessionToken: nextToken });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
