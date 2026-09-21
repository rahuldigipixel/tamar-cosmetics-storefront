"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, SlidersHorizontal, X } from "lucide-react";
import type { Brand, Product, ProductCategory } from "@/types/product";
import { ProductGridCard } from "@/components/product/ProductGridCard";
import { fetchCategoryProducts, type CategorySortOption } from "@/lib/wpgraphql/actions";
import { CustomSelect } from "@/components/ui/CustomSelect";

const ALL_CATEGORIES_VALUE = "__all__";
const ALL_BRANDS_VALUE = "__all__";

const SORT_OPTIONS: { value: CategorySortOption | "DEFAULT"; label: string }[] = [
  { value: "DEFAULT", label: "מיון ברירת מחדל" },
  { value: "POPULARITY", label: "הכי פופולריים" },
  { value: "DATE", label: "החדשים ביותר" },
  { value: "PRICE_ASC", label: "מחיר: מהזול ליקר" },
  { value: "PRICE_DESC", label: "מחיר: מהיקר לזול" },
];

// Falls back to a flat 0–1000 only when there's nothing to measure —
// otherwise the slider's own bounds are the cheapest/priciest product
// actually in this category, so it doesn't start at an arbitrary 0.
function computePriceBounds(products: Product[]): { min: number; max: number } {
  const prices = products
    .map((p) => Number(p.onSale && p.salePrice ? p.salePrice : p.price))
    .filter((n) => Number.isFinite(n));
  if (prices.length === 0) return { min: 0, max: 1000 };
  const min = Math.floor(Math.min(...prices));
  const max = Math.ceil(Math.max(...prices));
  return { min, max: max > min ? max : min + 100 };
}

function PriceRangeFilter({
  min,
  max,
  boundMin,
  boundMax,
  onApply,
}: {
  min: number;
  max: number;
  boundMin: number;
  boundMax: number;
  onApply: (min: number, max: number) => void;
}) {
  const [localMin, setLocalMin] = useState(min);
  const [localMax, setLocalMax] = useState(max);

  const minPct = ((localMin - boundMin) / (boundMax - boundMin)) * 100;
  const maxPct = ((localMax - boundMin) / (boundMax - boundMin)) * 100;

  return (
    <div className="flex flex-col gap-3">
      <div className="relative h-1.5 rounded-full bg-black/10">
        <div
          className="absolute h-full rounded-full bg-brand-accent"
          style={{ insetInlineStart: `${minPct}%`, width: `${Math.max(0, maxPct - minPct)}%` }}
        />
        <input
          type="range"
          min={boundMin}
          max={boundMax}
          value={localMin}
          onChange={(e) => setLocalMin(Math.min(Number(e.target.value), localMax))}
          className="pointer-events-none absolute inset-x-0 -top-2 h-5 w-full appearance-none bg-transparent [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-brand-accent [&::-moz-range-thumb]:shadow-md [&::-moz-range-track]:bg-transparent [&::-webkit-slider-runnable-track]:bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:mt-[2px] [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-brand-accent [&::-webkit-slider-thumb]:shadow-md"
        />
        <input
          type="range"
          min={boundMin}
          max={boundMax}
          value={localMax}
          onChange={(e) => setLocalMax(Math.max(Number(e.target.value), localMin))}
          className="pointer-events-none absolute inset-x-0 -top-2 h-5 w-full appearance-none bg-transparent [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-brand-accent [&::-moz-range-thumb]:shadow-md [&::-moz-range-track]:bg-transparent [&::-webkit-slider-runnable-track]:bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:mt-[2px] [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-brand-accent [&::-webkit-slider-thumb]:shadow-md"
        />
      </div>

      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => onApply(localMin, localMax)}
          className="shrink-0 rounded-full bg-brand-soft px-4 py-1.5 text-base font-semibold text-brand-accent transition-colors hover:bg-gradient-to-l hover:from-brand-accent hover:to-[#ff6b72] hover:text-white"
        >
          חיפוש
        </button>
        <span className="text-base font-medium text-black/70">
          {localMax} ₪ - {localMin} ₪
        </span>
      </div>
    </div>
  );
}

export function CategoryProductGrid({
  categorySlug,
  brandSlug,
  initialProducts,
  initialHasNextPage,
  initialEndCursor,
  categories,
  brands,
}: {
  /** Exactly one of categorySlug/brandSlug should be passed. */
  categorySlug?: string;
  brandSlug?: string;
  initialProducts: Product[];
  initialHasNextPage: boolean;
  initialEndCursor: string | null;
  /** When passed, renders a Categories filter — picking one navigates to that category's own page. */
  categories?: ProductCategory[];
  /** When passed, renders a Brand filter (with logo thumbs) that refetches this same list. */
  brands?: Brand[];
}) {
  const router = useRouter();
  const [products, setProducts] = useState(initialProducts);
  const [hasNextPage, setHasNextPage] = useState(initialHasNextPage);
  const [endCursor, setEndCursor] = useState(initialEndCursor);
  const [sort, setSort] = useState<CategorySortOption | "DEFAULT">("DEFAULT");
  const [priceRange, setPriceRange] = useState<{ min: number; max: number } | null>(null);
  const [selectedBrand, setSelectedBrand] = useState(ALL_BRANDS_VALUE);
  const [isPending, startTransition] = useTransition();
  const sentinelRef = useRef<HTMLDivElement>(null);
  const skipNextRefetch = useRef(true);
  // Computed once from the first page of results — cheap, and re-deriving
  // it on every sort/price refetch would keep shrinking the slider's own
  // range toward whatever's currently filtered in.
  const [priceBounds] = useState(() => computePriceBounds(initialProducts));

  const effectiveBrand = selectedBrand === ALL_BRANDS_VALUE ? brandSlug : selectedBrand;
  const hasActiveFilters = sort !== "DEFAULT" || priceRange !== null || selectedBrand !== ALL_BRANDS_VALUE;

  function runQuery(after: string | null, append: boolean) {
    startTransition(async () => {
      const result = await fetchCategoryProducts({
        category: categorySlug,
        brand: effectiveBrand,
        after,
        sort: sort === "DEFAULT" ? undefined : sort,
        minPrice: priceRange?.min,
        maxPrice: priceRange?.max,
        first: 20,
      });
      setProducts((prev) => (append ? [...prev, ...result.products] : result.products));
      setHasNextPage(result.hasNextPage);
      setEndCursor(result.endCursor);
    });
  }

  // Re-running the query resets pagination to page 1 — sort/price/brand are
  // query params, not additive pages, so switching any of them must replace
  // the list. Skipped on mount since `initialProducts` already matches the
  // defaults.
  useEffect(() => {
    if (skipNextRefetch.current) {
      skipNextRefetch.current = false;
      return;
    }
    runQuery(null, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort, priceRange, selectedBrand]);

  function clearFilters() {
    setSort("DEFAULT");
    setPriceRange(null);
    setSelectedBrand(ALL_BRANDS_VALUE);
  }

  // Infinite scroll: load the next page once the sentinel below the grid
  // enters the viewport, instead of requiring a "load more" click.
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isPending) {
          runQuery(endCursor, true);
        }
      },
      { rootMargin: "400px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasNextPage, isPending, endCursor]);

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-[260px_1fr]">
      <aside className="z-10 flex h-fit max-h-[calc(100vh-11rem)] flex-col gap-6 overflow-y-auto rounded-2xl border border-black/5 bg-white p-5 shadow-sm md:sticky md:top-44">
        <div className="flex items-center justify-between gap-2">
          <p className="flex items-center gap-1.5 text-base font-bold text-black/80">
            <SlidersHorizontal className="h-4 w-4 text-brand-accent" />
            סינון
          </p>
          {hasActiveFilters ? (
            <button
              type="button"
              onClick={clearFilters}
              className="flex items-center gap-1 text-base font-medium text-black/50 transition-colors hover:text-brand-accent"
            >
              <X className="h-3.5 w-3.5" />
              נקה סינון
            </button>
          ) : null}
        </div>

        <div>
          <p className="mb-2 text-base font-bold text-black/80">מיון</p>
          <CustomSelect value={sort} onChange={setSort} options={SORT_OPTIONS} />
        </div>

        {categories && categories.length > 0 ? (
          <div className="border-t border-black/5 pt-5">
            <p className="mb-2 text-base font-bold text-black/80">קטגוריות</p>
            <CustomSelect
              value={categorySlug ?? ALL_CATEGORIES_VALUE}
              onChange={(slug) => {
                if (slug !== categorySlug) router.push(`/product-category/${slug}/`);
              }}
              options={categories.map((c) => ({ value: c.slug, label: c.name }))}
            />
          </div>
        ) : null}

        <div className="border-t border-black/5 pt-5">
          <p className="mb-3 text-base font-bold text-black/80">טווח מחירים</p>
          <PriceRangeFilter
            min={priceRange?.min ?? priceBounds.min}
            max={priceRange?.max ?? priceBounds.max}
            boundMin={priceBounds.min}
            boundMax={priceBounds.max}
            onApply={(min, max) => setPriceRange({ min, max })}
          />
        </div>

        {brands && brands.length > 0 ? (
          <div className="border-t border-black/5 pt-5">
            <p className="mb-2 text-base font-bold text-black/80">מותג</p>
            <CustomSelect
              value={selectedBrand}
              onChange={setSelectedBrand}
              options={[
                { value: ALL_BRANDS_VALUE, label: "כל המותגים" },
                ...brands.map((b) => ({ value: b.slug, label: b.name, image: b.thumbnailUrl })),
              ]}
            />
          </div>
        ) : null}
      </aside>

      <div>
        {products.length === 0 && !isPending ? (
          <p className="text-black/60">{brandSlug ? "לא נמצאו מוצרים במותג זה." : "לא נמצאו מוצרים בקטגוריה זו."}</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            {products.map((product) => (
              <ProductGridCard key={product.id} product={product} />
            ))}
          </div>
        )}

        <div ref={sentinelRef} className="flex justify-center py-8">
          {isPending ? <Loader2 className="h-6 w-6 animate-spin text-brand-accent" /> : null}
        </div>
      </div>
    </div>
  );
}
