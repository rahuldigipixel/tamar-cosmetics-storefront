import { NextRequest, NextResponse } from "next/server";
import { subscribeClub } from "@/lib/wpgraphql/tamarApi";

export async function POST(request: NextRequest) {
  const { name, email, phone, birthday, source } = await request.json();
  if (!name || !email || !phone) {
    return NextResponse.json({ success: false, error: "missing_fields" }, { status: 400 });
  }
  const result = await subscribeClub({ name, email, phone, birthday, source: source === "home" ? "home" : undefined });
  return NextResponse.json(result ?? { success: false });
}
