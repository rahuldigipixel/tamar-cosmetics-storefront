import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { wpEnv } from "@/lib/wpgraphql/env";

/**
 * WooCommerce/WPGraphQL side should POST here (e.g. via a `save_post` hook on
 * the tamar-headless-api plugin) whenever a product, category, or order
 * changes, so ISR pages don't wait out their `revalidate` window.
 *
 * Body: { secret: string, tags: string[] }
 * Example tags: "products", "product:my-slug", "categories"
 */
export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as { secret?: string; tags?: string[] } | null;

  if (!body?.secret || body.secret !== wpEnv.revalidationSecret) {
    return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
  }

  const tags = body.tags?.length ? body.tags : ["products", "categories"];
  for (const tag of tags) {
    // Webhooks need the change to be visible immediately, so expire now
    // rather than the deferred stale-while-revalidate ("max") semantics.
    revalidateTag(tag, { expire: 0 });
  }

  return NextResponse.json({ revalidated: true, tags });
}
