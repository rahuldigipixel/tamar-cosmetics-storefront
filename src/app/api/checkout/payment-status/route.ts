import { NextRequest, NextResponse } from "next/server";
import { checkoutPaymentRequest } from "@/lib/wpgraphql/tamarApi";

/** Polled while the payment iframe is open — lets the page move on even if the gateway never navigates the frame. */
export async function GET(request: NextRequest) {
  const order_id = request.nextUrl.searchParams.get("order") ?? "";
  const order_key = request.nextUrl.searchParams.get("key") ?? "";
  if (!order_id || !order_key) return NextResponse.json({ error: "bad request" }, { status: 400 });

  const { ok, status, data } = await checkoutPaymentRequest<{ paid: boolean; status: string }>(
    "/checkout/payment-status",
    { order_id, order_key },
    "GET"
  );
  if (!ok || !data || !("paid" in data)) return NextResponse.json({ error: "status unavailable" }, { status: status >= 400 ? status : 502 });
  return NextResponse.json(data);
}
