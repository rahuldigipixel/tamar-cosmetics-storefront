import { notFound } from "next/navigation";
import { getProductBySlug, normalizeProductSlug } from "@/lib/wpgraphql/products";

// The existence check lives here, not in page.tsx: the sibling loading.tsx starts streaming (HTTP 200) before the
// page body runs, so a notFound() there can never produce a real 404 status. A layout sits outside that Suspense
// boundary. The lookup is React `cache()`d, so the page and generateMetadata reuse this same single request.
export default async function ProductLayout({ children, params }: { children: React.ReactNode; params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!(await getProductBySlug(normalizeProductSlug(slug)))) notFound();
  return children;
}
