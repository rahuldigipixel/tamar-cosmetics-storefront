import { NextRequest, NextResponse } from "next/server";
import { getProductsByIds } from "@/lib/wpgraphql/products";

const MAX_IDS = 100;

/** GET /api/products?ids=1,2,3 — card data for several products in one backend round trip. */
export async function GET(request: NextRequest) {
  const ids = (request.nextUrl.searchParams.get("ids") ?? "")
    .split(",")
    .map(Number)
    .filter((n) => Number.isInteger(n) && n > 0)
    .slice(0, MAX_IDS);

  const products = await getProductsByIds(ids);
  return NextResponse.json({ products });
}
