import { NextRequest, NextResponse } from "next/server";
import { addToWishlist, getWishlist, removeFromWishlist } from "@/lib/wpgraphql/tamarApi";

function tokenFrom(request: NextRequest): string | null {
  const header = request.headers.get("Authorization");
  const match = header?.match(/Bearer\s+(\S+)/i);
  return match ? match[1] : null;
}

export async function GET(request: NextRequest) {
  const token = tokenFrom(request);
  if (!token) return NextResponse.json([]);
  const items = await getWishlist(token);
  return NextResponse.json(items ?? []);
}

export async function POST(request: NextRequest) {
  const token = tokenFrom(request);
  if (!token) return NextResponse.json({ error: "יש להתחבר כדי לשמור ברשימת המשאלות." }, { status: 401 });
  const { productId } = await request.json();
  const items = await addToWishlist(token, productId);
  return NextResponse.json(items ?? []);
}

export async function DELETE(request: NextRequest) {
  const token = tokenFrom(request);
  if (!token) return NextResponse.json({ error: "יש להתחבר כדי לשמור ברשימת המשאלות." }, { status: 401 });
  const { productId } = await request.json();
  const items = await removeFromWishlist(token, productId);
  return NextResponse.json(items ?? []);
}
