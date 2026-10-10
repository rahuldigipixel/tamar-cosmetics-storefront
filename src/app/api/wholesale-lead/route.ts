import { NextRequest, NextResponse } from "next/server";
import { sendLeadMail } from "@/lib/mail/leadMail";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const { name, email, phone } = await request.json().catch(() => ({}));
  const result = await sendLeadMail("wholesale", { name, email, phone });
  if (result === "invalid") return NextResponse.json({ success: false, error: "missing_fields" }, { status: 400 });
  if (result === "failed") return NextResponse.json({ success: false }, { status: 500 });
  return NextResponse.json({ success: true });
}
