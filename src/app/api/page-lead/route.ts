import { NextRequest, NextResponse } from "next/server";
import { sendLeadMail, type LeadForm } from "@/lib/mail/leadMail";

export const runtime = "nodejs";

// Allow-list of public form ids that may be emailed from this endpoint.
const FORMS: LeadForm[] = ["order-cancellation", "contact", "suppliers"];

export async function POST(request: NextRequest) {
  const { form, name, email, phone } = await request.json().catch(() => ({}));
  if (!FORMS.includes(form)) {
    return NextResponse.json({ success: false, error: "missing_fields" }, { status: 400 });
  }
  const result = await sendLeadMail(form, { name, email, phone });
  if (result === "invalid") return NextResponse.json({ success: false, error: "missing_fields" }, { status: 400 });
  if (result === "failed") return NextResponse.json({ success: false }, { status: 500 });
  return NextResponse.json({ success: true });
}
