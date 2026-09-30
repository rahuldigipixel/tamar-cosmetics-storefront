import { NextRequest, NextResponse } from "next/server";
import { getOrders } from "@/lib/wpgraphql/tamarApi";

export async function GET(request: NextRequest) {
  const token = request.headers.get("Authorization")?.match(/Bearer\s+(\S+)/i)?.[1];
  if (!token) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const orders = await getOrders(token);
  if (!orders) return NextResponse.json({ error: "failed" }, { status: 502 });
  return NextResponse.json(orders);
}
