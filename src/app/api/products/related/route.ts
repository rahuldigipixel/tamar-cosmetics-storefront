import { NextRequest, NextResponse } from "next/server";
import { listProducts } from "@/lib/wpgraphql/products";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const exclude = new Set(searchParams.getAll("exclude"));
  // Client-supplied — cap it so a request can't pull an arbitrarily large list from WooCommerce.
  const first = Math.min(Math.max(Number(searchParams.get("first")) || 8, 1), 20);

  if (!category) {
    return NextResponse.json({ products: [] });
  }

  const { products } = await listProducts({ category, first });
  return NextResponse.json({ products: products.filter((p) => !exclude.has(String(p.databaseId))) });
}
