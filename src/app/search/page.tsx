import Link from "next/link";
import { listProducts } from "@/lib/wpgraphql/products";
import { CategoryProductGrid } from "@/components/product/CategoryProductGrid";

// Served at "/?s=term&post_type=product" via a rewrite in next.config.ts.
export const revalidate = 60;

interface SearchPageProps {
  searchParams: Promise<{ s?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { s } = await searchParams;
  const term = (s ?? "").trim().slice(0, 100);

  // Single combined page-content call (plus the shared global-data one).
  const { products, hasNextPage, endCursor } = term
    ? await listProducts({ search: term, first: 20 })
    : { products: [], hasNextPage: false, endCursor: null };

  return (
    <div>
      <div className="bg-[#fde7eb] px-[15px] py-[15px] text-center">
        {/* Arial 700 / 40px / 48px / #242424 — measured from the legacy search page. */}
        <h1 className="font-[Arial,Helvetica,sans-serif] text-[28px] font-bold leading-[1.2] text-[#242424] md:text-[40px] md:leading-[48px]">
          תוצאות חיפוש עבור: {term}
        </h1>
      </div>

      <nav
        aria-label="breadcrumb"
        // Legacy breadcrumb: Arial 21px / 34px — links 400 #555, current page 600 #333.
        className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-[6px] px-[15px] py-[8px] font-[Arial,Helvetica,sans-serif] text-[21px] leading-[34px] text-[#555]"
      >
        <Link href="/" className="font-normal text-[#555] transition-colors hover:text-[#333]">
          עמוד הבית
        </Link>
        <span>/</span>
        <Link href="/shop" className="font-normal text-[#555] transition-colors hover:text-[#333]">
          חנות
        </Link>
        <span>/</span>
        <span className="font-semibold text-[#333]">תוצאות חיפוש עבור “{term}”</span>
      </nav>

      <div className="mx-auto max-w-[1600px] px-[15px] pt-[30px] pb-12">
        <CategoryProductGrid
          key={term}
          search={term}
          hideFilters
          initialProducts={products}
          initialHasNextPage={hasNextPage}
          initialEndCursor={endCursor}
        />
      </div>
    </div>
  );
}
