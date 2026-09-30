import { NextRequest, NextResponse } from "next/server";
import { getOrder } from "@/lib/wpgraphql/tamarApi";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = request.headers.get("Authorization")?.match(/Bearer\s+(\S+)/i)?.[1];
  if (!token) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;
  const order = await getOrder(token, Number(id));
  if (!order) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(order);
}
