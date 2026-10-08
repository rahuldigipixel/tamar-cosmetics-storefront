import { NextRequest, NextResponse } from "next/server";
import { subscribeBackInStock } from "@/lib/wpgraphql/tamarApi";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  const { productId, email } = await request.json().catch(() => ({}));
  const id = Number(productId);
  if (!Number.isInteger(id) || id <= 0 || typeof email !== "string" || !EMAIL_RE.test(email.trim())) {
    return NextResponse.json({ success: false, error: "invalid" }, { status: 400 });
  }
  const result = await subscribeBackInStock(id, email.trim());
  return NextResponse.json(result ?? { success: false });
}
