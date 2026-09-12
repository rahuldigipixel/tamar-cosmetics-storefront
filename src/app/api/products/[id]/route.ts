import { NextRequest, NextResponse } from "next/server";
import { getProductByDatabaseId } from "@/lib/wpgraphql/products";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProductByDatabaseId(Number(id));
  if (!product) return NextResponse.json(null, { status: 404 });
  return NextResponse.json(product);
}
