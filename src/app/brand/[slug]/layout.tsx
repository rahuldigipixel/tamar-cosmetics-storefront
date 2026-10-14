import { notFound } from "next/navigation";
import { getBrandPageData } from "@/lib/wpgraphql/brandPage";

// Real 404 status for unknown brands. Checked in a layout because the sibling loading.tsx streams a 200 before
// page.tsx runs. getBrandPageData is React `cache()`d (same slug form as page.tsx), so it is one shared request.
export default async function BrandLayout({ children, params }: { children: React.ReactNode; params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getBrandPageData(decodeURIComponent(slug).normalize("NFC"), 20);
  if (!data.brand) notFound();
  return children;
}
