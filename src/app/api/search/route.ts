import { NextRequest, NextResponse } from "next/server";
import { fetchGraphQLSafe } from "@/lib/wpgraphql/client";

/**
 * Header live-search (reference site: Woodmart ajax search — 3+ chars,
 * 5 results, thumbnail + SKU + price). Lean on purpose: only the fields the
 * dropdown renders, one backend round trip, cached per query string.
 */
const SEARCH_QUERY = /* GraphQL */ `
  query HeaderSearch($search: String!) {
    products(first: 5, where: { search: $search, status: "publish" }) {
      nodes {
        databaseId
        slug
        name
        ... on SimpleProduct {
          sku
          price(format: RAW)
        }
        ... on VariableProduct {
          sku
          price(format: RAW)
        }
        image {
          sourceUrl(size: THUMBNAIL)
          altText
        }
      }
    }
  }
`;

interface SearchNode {
  databaseId: number;
  slug: string;
  name: string;
  sku?: string | null;
  price?: string | null;
  image?: { sourceUrl: string | null; altText: string | null } | null;
}

export interface HeaderSearchResult {
  id: number;
  slug: string;
  name: string;
  sku: string;
  price: number | null;
  image: { url: string; alt: string } | null;
}

export async function GET(request: NextRequest) {
  const q = (request.nextUrl.searchParams.get("q") ?? "").trim().slice(0, 100);
  if (q.length < 3) return NextResponse.json({ results: [] });

  const data = await fetchGraphQLSafe<{ products: { nodes: SearchNode[] } }>(
    SEARCH_QUERY,
    { search: q },
    { tags: ["products"], revalidate: 300 }
  );

  const results: HeaderSearchResult[] = (data?.products.nodes ?? []).map((n) => {
    // Variable products return a "min, max" range — show the lowest.
    const price = n.price ? parseFloat(n.price.split(",")[0]) : NaN;
    return {
      id: n.databaseId,
      slug: n.slug,
      name: n.name,
      sku: n.sku ?? "",
      price: Number.isFinite(price) ? price : null,
      image: n.image?.sourceUrl ? { url: n.image.sourceUrl, alt: n.image.altText || n.name } : null,
    };
  });

  return NextResponse.json({ results });
}
