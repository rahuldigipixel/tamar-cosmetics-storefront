import { NextRequest, NextResponse } from "next/server";
import { submitWholesaleLead } from "@/lib/wpgraphql/tamarApi";

export async function POST(request: NextRequest) {
  const { name, email, phone } = await request.json();
  if (!name || !email || !phone) {
    return NextResponse.json({ success: false, error: "missing_fields" }, { status: 400 });
  }
  const result = await submitWholesaleLead({ name, email, phone });
  return NextResponse.json(result ?? { success: false });
}
