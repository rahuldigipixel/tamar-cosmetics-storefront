import { notFound } from "next/navigation";
import { categoryPathKey, loadCategoryPage } from "@/lib/wpgraphql/categoryRoute";

// Real 404 status for unknown categories. Checked in a layout because the sibling loading.tsx streams a 200 before
// page.tsx runs. loadCategoryPage is React `cache()`d, so generateMetadata, this layout and the page share one request.
export default async function ProductCategoryLayout({ children, params }: { children: React.ReactNode; params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const { info } = await loadCategoryPage(categoryPathKey(slug));
  // `info` is the plugin's authoritative lookup; when it is absent (field unavailable) keep the page open.
  if (info && !info.name) notFound();
  return children;
}
