import { notFound } from "next/navigation";
import { getPostBySlug } from "@/lib/wpgraphql/posts";

// Real 404 status for unknown root-level URLs (this segment catches every path no other route claims, e.g.
// /llms.txt, /typo). Checked in a layout because the sibling loading.tsx streams a 200 before page.tsx runs.
// getPostBySlug is React `cache()`d, so the page and generateMetadata reuse this one request.
export default async function PostLayout({ children, params }: { children: React.ReactNode; params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!(await getPostBySlug(slug))) notFound();
  return children;
}
