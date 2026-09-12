import { NextRequest, NextResponse } from "next/server";
import { applyCoupon, removeCoupon } from "@/lib/wpgraphql/cart";

export async function POST(request: NextRequest) {
  const sessionToken = request.headers.get("X-Cart-Session");
  const { code } = await request.json();

  try {
    const { cart, sessionToken: nextToken } = await applyCoupon(code, sessionToken);
    return NextResponse.json({ cart, sessionToken: nextToken });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  const sessionToken = request.headers.get("X-Cart-Session");
  const { code } = await request.json();

  try {
    const { cart, sessionToken: nextToken } = await removeCoupon([code], sessionToken);
    return NextResponse.json({ cart, sessionToken: nextToken });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
