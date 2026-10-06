import { NextRequest, NextResponse } from "next/server";
import { submitPageLead } from "@/lib/wpgraphql/tamarApi";

// Allow-list: public form id -> the plugin's form route (class-simple-pages.php).
const ROUTES: Record<string, string> = {
  "order-cancellation": "order-cancellation-lead",
  contact: "contact-lead",
  suppliers: "suppliers-lead",
};

export async function POST(request: NextRequest) {
  const { form, name, email, phone } = await request.json();
  const route = ROUTES[form];
  if (!route || !name || !email || !phone) {
    return NextResponse.json({ success: false, error: "missing_fields" }, { status: 400 });
  }
  const result = await submitPageLead(route, { name, email, phone });
  return NextResponse.json(result ?? { success: false });
}
