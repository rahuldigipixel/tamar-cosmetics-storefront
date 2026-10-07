import { NextRequest, NextResponse } from "next/server";
import { checkoutPaymentRequest } from "@/lib/wpgraphql/tamarApi";

/** Opens the GoCredit card form for an order the checkout mutation just created (shown in an <iframe> on /checkout). */
export async function POST(request: NextRequest) {
  const { order_id, order_key } = (await request.json()) as { order_id?: number; order_key?: string };
  if (!order_id || !order_key) {
    return NextResponse.json({ error: "פרטי הזמנה חסרים" }, { status: 400 });
  }

  const { ok, status, data } = await checkoutPaymentRequest<{ iframe_url: string }>(
    "/checkout/payment-iframe",
    { order_id, order_key, return_base: request.nextUrl.origin },
    "POST"
  );
  if (!ok || !data || !("iframe_url" in data)) {
    const message = data && "message" in data ? data.message : undefined;
    return NextResponse.json({ error: message ?? "לא ניתן לפתוח את דף התשלום המאובטח כרגע. נסו שוב." }, { status: status >= 400 ? status : 502 });
  }
  return NextResponse.json({ iframe_url: data.iframe_url });
}
