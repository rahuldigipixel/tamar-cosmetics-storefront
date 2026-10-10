import { NextRequest, NextResponse } from "next/server";
import { sendLeadMail } from "@/lib/mail/leadMail";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const { name, email, phone, birthday, source } = await request.json().catch(() => ({}));
  const result = await sendLeadMail(source === "home" ? "club-home" : "club", { name, email, phone, birthday });
  if (result === "invalid") return NextResponse.json({ success: false, error: "missing_fields" }, { status: 400 });
  if (result === "failed") return NextResponse.json({ success: false }, { status: 500 });
  return NextResponse.json({ success: true });
}
