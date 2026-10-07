import { NextResponse } from "next/server";
import { getTermsPage } from "@/lib/wpgraphql/tamarApi";

export const revalidate = 300;

// Terms & conditions HTML for the checkout's expandable "תנאי שימוש" box (loaded on demand, not with the page).
export async function GET() {
  const page = await getTermsPage();
  return NextResponse.json(
    { heading: page?.heading ?? "", html: page?.contentHtml ?? "" },
    { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } }
  );
}
