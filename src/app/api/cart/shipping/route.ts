import { NextRequest, NextResponse } from "next/server";
import { updateShippingMethod } from "@/lib/wpgraphql/cart";

export async function POST(request: NextRequest) {
  const sessionToken = request.headers.get("X-Cart-Session");
  const { methodId } = await request.json();

  try {
    const { cart, sessionToken: nextToken } = await updateShippingMethod(methodId, sessionToken);
    return NextResponse.json({ cart, sessionToken: nextToken });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
