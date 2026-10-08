import Link from "next/link";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { getShopData } from "@/lib/wpgraphql/shop";
import { CategoryProductGrid } from "@/components/product/CategoryProductGrid";

export const revalidate = 60;

export const metadata: Metadata = pageMetadata({
  title: "חנות",
  description: "כל מוצרי תמר קוסמטיקס במקום אחד - לק ג׳ל, אקריל, ציוד לציפורניים, פדיקור, גבות והסרת שיער במחירי סיטונאי.",
  route: "/shop",
});

export default async function ShopPage() {
 const { products, hasNextPage, endCursor, categories, brands, countries, priceBounds } = await getShopData(20);

 return (
 // Same structure as the legacy /shop/ (and our category page): pink title band
 // (40px/700 #242424) → 12px breadcrumb → filter bar → product grid.
 <div>
 <div className="bg-[#fde7eb] px-[15px] py-[15px] text-center">
 <h1 className="text-[28px] font-bold leading-[1.2] text-[#242424] md:text-[40px] md:leading-[48px]">חנות</h1>
 </div>

 <nav
 aria-label="breadcrumb"
 className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-[6px] px-[15px] py-[8px] text-[12px] leading-[19px] text-[#333]"
 >
 <Link href="/" className="text-[#777] transition-colors hover:text-[#333]">
 עמוד הבית
 </Link>
 <span>/</span>
 <span className="font-semibold text-[#333]">חנות</span>
 </nav>

 <div className="mx-auto max-w-[1600px] px-[15px] pt-[15px] pb-0 md:pt-[30px] md:pb-12">
 <CategoryProductGrid
 initialProducts={products}
 initialHasNextPage={hasNextPage}
 initialEndCursor={endCursor}
 categories={categories}
 brands={brands}
 countries={countries}
 priceBounds={priceBounds}
 />
 </div>
 </div>
 );
}
