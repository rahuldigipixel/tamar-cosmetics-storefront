import { NextRequest, NextResponse } from "next/server";
import { addToWishlist, getWishlist, removeFromWishlist } from "@/lib/wpgraphql/tamarApi";

export async function GET(request: NextRequest) {
  const wishlistId = request.nextUrl.searchParams.get("wishlist_id") ?? "";
  const items = await getWishlist(wishlistId);
  return NextResponse.json(items ?? []);
}

export async function POST(request: NextRequest) {
  const { wishlistId, productId } = await request.json();
  const items = await addToWishlist(wishlistId, productId);
  return NextResponse.json(items ?? []);
}

export async function DELETE(request: NextRequest) {
  const { wishlistId, productId } = await request.json();
  const items = await removeFromWishlist(wishlistId, productId);
  return NextResponse.json(items ?? []);
}
