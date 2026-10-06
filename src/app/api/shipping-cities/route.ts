import { NextResponse } from "next/server";
import { getShippingCities } from "@/lib/wpgraphql/tamarApi";

// Lazy: only called when the cart's "שינוי הכתובת" picker opens. The list is static, so cache it for a day.
export async function GET() {
  const cities = await getShippingCities();
  return NextResponse.json(cities ?? [], { headers: { "Cache-Control": "public, max-age=86400" } });
}
