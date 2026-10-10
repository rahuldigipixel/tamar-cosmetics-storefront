"use client";

import { useEffect, useRef, useState, useTransition, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, Loader2, Minus, Plus, X } from "lucide-react";
import type { Brand, CountryOption, Product } from "@/types/product";
import { CategoryProductCard } from "@/components/product/CategoryProductCard";
import { fetchCategoryProducts, type CategorySortOption } from "@/lib/wpgraphql/actions";

const ALL_CATEGORIES_VALUE = "__all__";
const ALL_BRANDS_VALUE = "__all__";
const ALL_COUNTRIES_VALUE = "__all__";

/** One option of the Categories filter; `href` is the page it navigates to (category pages). */
export interface CategoryFilterOption {
  id: string;
  name: string;
  slug: string;
  href?: string;
  /** Nesting level, for the indented hierarchy list on the brand page. */
  depth?: number;
  image?: string;
}

/**
 * Mobile category pages: the filter accordion is replaced by this sticky bar under the header
 * (legacy `wc_sub_categories_mobile_filter`) — pink strip, bold "סינון מוצרים" + chevron, opening
 * a scrolling list of the parent/sibling categories with their thumbnails.
 */
export function MobileCategoryBar({ options }: { options: CategoryFilterOption[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  // The site header scrolls away and a compact copy is pinned (`position: fixed`) later — stick flush under
  // whichever is showing: top 0 while the header is out of view, its height once the pinned one is there.
  const [top, setTop] = useState(0);

  useEffect(() => {
    let raf = 0;
    function sync() {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const header = document.querySelector("header");
        setTop(header && getComputedStyle(header).position === "fixed" ? header.offsetHeight : 0);
      });
    }
    sync();
    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    // The header flips to `fixed` a render after the scroll event — watch it so the offset never goes stale.
    const header = document.querySelector("header");
    const observer = new MutationObserver(sync);
    if (header) observer.observe(header, { attributes: true, attributeFilter: ["class", "style"] });
    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    function onDown(e: Event) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  return (
    // Rendered as a direct child of the page root (right under the header) so `sticky` spans the whole page.
    <div ref={ref} style={{ top }} className="sticky z-30 -mb-[4px] border-b-2 border-black/10 bg-[#fde7eb] font-[Arial,Helvetica,sans-serif] transition-[top] duration-300 ease-out md:hidden">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-[40px] w-full items-center justify-between px-[15px] text-[16px] font-semibold leading-[16px] text-black"
      >
        <span>סינון מוצרים</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open ? (
        <ul className="absolute inset-x-0 top-full max-h-[49vh] overflow-y-auto bg-white shadow-[0_6px_9px_rgba(0,0,0,.12)]">
          {options.map((o) => (
            <li key={o.id} className="border-b border-[#ababab]">
              <Link
                href={o.href ?? `/product-category/${o.slug}/`}
                prefetch={false}
                onClick={() => setOpen(false)}
                className="flex items-center gap-[5px] px-[15px] py-[4px] text-[16px] font-normal leading-[21px] text-[#777]"
              >
                {o.image ? <Image src={o.image} alt="" width={50} height={50} sizes="50px" className="h-[50px] w-[50px] shrink-0 object-contain" /> : null}
                {o.name}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

// `categorySlug` can arrive still percent-encoded (nested /parent/child/
// category URLs — see the same normalization in
// product-category/[...slug]/page.tsx) and/or under a different Unicode
// normalization form than the plain text WPGraphQL returns for `c.slug`
// (visually identical, byte-different). Without decoding+normalizing both
// sides, the current category's option in the dropdown never matches and
// the Categories filter silently shows nothing selected.
function normalizeSlug(slug: string) {
  try {
    return decodeURIComponent(slug).normalize("NFC");
  } catch {
    return slug.normalize("NFC");
  }
}

const SORT_OPTIONS: { value: CategorySortOption | "DEFAULT"; label: string }[] = [
  { value: "DEFAULT", label: "סידור ברירת מחדל" },
  { value: "POPULARITY", label: "מיין לפי פופולריות" },
  { value: "RATING", label: "מיין לפי דירוג ממוצע" },
  { value: "DATE", label: "מיין לפי המעודכן ביותר" },
  { value: "PRICE_ASC", label: "מיין מהזול ליקר" },
  { value: "PRICE_DESC", label: "מיין מהיקר לזול" },
];

// The filters live in the URL query, same parameter names as the legacy WooCommerce
// site (min_price / max_price / filter_brand / filter_country / orderby), so a filtered
// page is shareable and the filters follow the shopper when they switch category.
const ORDERBY_PARAM: Record<CategorySortOption, string> = {
  POPULARITY: "popularity",
  RATING: "rating",
  DATE: "date",
  PRICE_ASC: "price",
  PRICE_DESC: "price-desc",
};

interface UrlFilters {
  sort: CategorySortOption | "DEFAULT";
  priceRange: { min: number; max: number } | null;
  brand: string;
  country: string;
  category: string;
}

function readUrlFilters(search: string): UrlFilters {
  const q = new URLSearchParams(search);
  const orderby = q.get("orderby");
  const sort = (Object.keys(ORDERBY_PARAM) as CategorySortOption[]).find((k) => ORDERBY_PARAM[k] === orderby) ?? "DEFAULT";
  const min = Number(q.get("min_price"));
  const max = Number(q.get("max_price"));
  const hasPrice = q.has("min_price") && q.has("max_price") && Number.isFinite(min) && Number.isFinite(max) && max >= min;
  return {
    sort,
    priceRange: hasPrice ? { min, max } : null,
    brand: q.get("filter_brand")?.normalize("NFC") || "__all__",
    country: q.get("filter_country")?.normalize("NFC") || "__all__",
    category: q.get("product_cat")?.normalize("NFC") || "__all__",
  };
}

/** Rewrites only the filter params of `search`, leaving any other query params untouched. */
function writeUrlFilters(search: string, f: UrlFilters, includeCategory: boolean): string {
  const q = new URLSearchParams(search);
  for (const k of ["orderby", "min_price", "max_price", "filter_brand", "filter_country", ...(includeCategory ? ["product_cat"] : [])]) q.delete(k);
  if (f.sort !== "DEFAULT") q.set("orderby", ORDERBY_PARAM[f.sort]);
  if (f.priceRange) {
    q.set("min_price", String(f.priceRange.min));
    q.set("max_price", String(f.priceRange.max));
  }
  if (f.brand !== ALL_BRANDS_VALUE) q.set("filter_brand", f.brand);
  if (f.country !== ALL_COUNTRIES_VALUE) q.set("filter_country", f.country);
  if (includeCategory && f.category !== ALL_CATEGORIES_VALUE) q.set("product_cat", f.category);
  const out = q.toString();
  return out ? `?${out}` : "";
}

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

      {/* RTL, as on the reference: range text on the right, button on the left. */}
      <div className="flex items-center justify-between gap-2">
        {/* Explicit left-to-right pieces so the visual order is always
            "₪max - ₪min", as on the reference, regardless of bidi rules. */}
        <span dir="ltr" className="flex items-center gap-[6px] text-[15px] font-semibold text-[#333]">
          <bdi>₪{localMax}</bdi>
          <span>-</span>
          <bdi>₪{localMin}</bdi>
        </span>
        <button
          type="button"
          onClick={() => onApply(localMin, localMax)}
          className="h-[34px] shrink-0 rounded-[35px] bg-[#f3c3cc] px-[18px] text-[13px] font-semibold text-[#333] transition-colors hover:bg-[#d52027] hover:text-white"
        >
          חיפוש
        </button>
      </div>
    </div>
  );
}

/**
 * One cell of the horizontal filter bar. Reference (WoodMart product
 * filters): 42px row, 16px title on the right, current value as a small grey
 * chip, chevron on the left, 2px rgba(0,0,0,.1) bottom border; the options
 * open in a panel directly underneath. Closes on outside click / Escape.
 */
function FilterDropdown({
  title,
  value,
  children,
}: {
  title: string;
  value?: string;
  children: (close: () => void) => React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Opens on hover like the reference (mouse only — on touch, the tap's
  // synthetic hover would immediately re-toggle it), and on click/keyboard.
  const closeTimer = useRef<number | null>(null);
  function onPointerEnter(e: React.PointerEvent) {
    if (e.pointerType !== "mouse") return;
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    setOpen(true);
  }
  function onPointerLeave(e: React.PointerEvent) {
    if (e.pointerType !== "mouse") return;
    closeTimer.current = window.setTimeout(() => setOpen(false), 150);
  }

  return (
    <div ref={ref} className="relative" onPointerEnter={onPointerEnter} onPointerLeave={onPointerLeave}>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`flex h-[42px] w-full items-center gap-[8px] border-b-2 text-start font-[Arial,Helvetica,sans-serif] text-[16px] font-semibold leading-[16px] text-[#333] transition-colors ${
          open ? "border-[#d52027]" : "border-black/10 hover:border-black/25"
        }`}
      >
        <span className="shrink-0">{title}</span>
        {value ? (
          <span className="ms-auto min-w-0 truncate rounded-[3px] bg-[#f1f1f1] px-[7px] py-[4px] font-[Arial,Helvetica,sans-serif] text-[12px] font-semibold leading-[12px] text-[#333]">{value}</span>
        ) : null}
        <ChevronDown className={`${value ? "" : "ms-auto"} h-4 w-4 shrink-0 text-black/40 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open ? (
        <div className="absolute inset-x-0 top-full z-30 mt-[2px] max-h-[450px] min-w-[240px] overflow-y-auto bg-white shadow-[0_0_9px_rgba(0,0,0,.12)]">
          {children(() => setOpen(false))}
        </div>
      ) : null}
    </div>
  );
}

function OptionList<T extends string>({
  options,
  selected,
  onSelect,
}: {
  options: { value: T; label: string; image?: string; depth?: number }[];
  selected: T | string;
  onSelect: (value: T) => void;
}) {
  return (
    <ul className="py-[6px]">
      {options.map((o) => (
          <li key={o.value}>
            <button
              type="button"
              onClick={() => onSelect(o.value)}
              style={o.depth ? { paddingInlineStart: 18 + o.depth * 16 } : undefined}
              className={`flex w-full items-center px-[18px] py-[8px] text-start font-[Arial,Helvetica,sans-serif] text-[16px] font-normal leading-[21px] text-[#777] transition-colors hover:bg-[#f1f1f1] ${o.value === selected ? "bg-[#f1f1f1]" : ""}`}
            >
              {/* Logo only (as on the reference); the name is the alt text and the fallback when there is no logo. */}
              {o.image ? (<Image src={o.image} alt={o.label} width={60} height={30} sizes="60px" className="h-[30px] w-[60px] object-contain" />) : (o.label)}
            </button>
          </li>
      ))}
    </ul>
  );
}

export function CategoryProductGrid({
  categorySlug,
  categoryName,
  brandSlug,
  search,
  hideFilters = false,
  intro,
  initialProducts,
  initialHasNextPage,
  initialEndCursor,
  categories,
  brands,
  countries,
  priceBounds: allPriceBounds,
}: {
  /** Exactly one of categorySlug/brandSlug should be passed. */
  categorySlug?: string;
  /** The page's category title, shown as the "קטגוריות" chip when it isn't one of the options. */
  categoryName?: string;
  brandSlug?: string;
  /** Search-results mode: query the product list by this term. */
  search?: string;
  /** Search results show the bare grid — no filter bar. */
  hideFilters?: boolean;
  /** Description block shown above the filters on desktop, below them (filters first) on mobile. */
  intro?: ReactNode;
  initialProducts: Product[];
  initialHasNextPage: boolean;
  initialEndCursor: string | null;
  /**
   * When passed, renders a Categories filter. On a category page (`categorySlug`) picking one
   * navigates to that category's own page; elsewhere (brand page) it filters the list in place.
   */
  categories?: CategoryFilterOption[];
  /** When passed, renders a Brand filter (with logo thumbs) that refetches this same list. */
  brands?: Brand[];
  /** When passed, renders the "ארץ ייצור" (pa_country) filter that refetches this same list. */
  countries?: CountryOption[];
  /** Price range of the WHOLE list (from the backend) — the slider ends. Falls back to the first page's prices. */
  priceBounds?: { min: number; max: number } | null;
}) {
  const router = useRouter();
  const [products, setProducts] = useState(initialProducts);
  const [hasNextPage, setHasNextPage] = useState(initialHasNextPage);
  const [endCursor, setEndCursor] = useState(initialEndCursor);
  const [sort, setSort] = useState<CategorySortOption | "DEFAULT">("DEFAULT");
  const [priceRange, setPriceRange] = useState<{ min: number; max: number } | null>(null);
  const [selectedBrand, setSelectedBrand] = useState(ALL_BRANDS_VALUE);
  const [selectedCountry, setSelectedCountry] = useState(ALL_COUNTRIES_VALUE);
  // Only used when the page itself isn't a category (brand page) — there the Categories filter refetches in place.
  const [selectedCategory, setSelectedCategory] = useState(ALL_CATEGORIES_VALUE);
  const [filtersOpen, setFiltersOpen] = useState(false);
  // Mobile accordion clips while it animates; once fully open it must not clip the dropdown lists.
  const [filtersSettled, setFiltersSettled] = useState(false);
  const [isPending, startTransition] = useTransition();
  const sentinelRef = useRef<HTMLDivElement>(null);
  const skipNextRefetch = useRef(true);
  // Computed once from the first page of results — cheap, and re-deriving
  // it on every sort/price refetch would keep shrinking the slider's own
  // range toward whatever's currently filtered in.
  const [baseBounds] = useState(() => allPriceBounds ?? computePriceBounds(initialProducts));
  // A range taken from the URL can lie outside the first page's prices — widen the slider so it still fits.
  const priceBounds = priceRange
    ? { min: Math.min(baseBounds.min, priceRange.min), max: Math.max(baseBounds.max, priceRange.max) }
    : baseBounds;

  const effectiveBrand = selectedBrand === ALL_BRANDS_VALUE ? brandSlug : selectedBrand;
  const effectiveCategory = categorySlug ?? (selectedCategory === ALL_CATEGORIES_VALUE ? undefined : selectedCategory);

  // One removable chip per active filter (sort/price/brand — the category
  // isn't a "filter" here, it's the page itself), so any single one can be
  // cleared without resetting the others, plus a combined "clear all".
  const activeChips: { key: string; label: string; amount?: string; onRemove: () => void }[] = [];
  if (sort !== "DEFAULT") {
    activeChips.push({
      key: "sort",
      label: SORT_OPTIONS.find((o) => o.value === sort)?.label ?? "",
      onRemove: () => setSort("DEFAULT"),
    });
  }
  if (priceRange) {
    // Legacy shows two chips (min / max), both clearing the same range.
    activeChips.push(
      { key: "price-min", label: "מינימום", amount: `₪${priceRange.min.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, onRemove: () => setPriceRange(null) },
      { key: "price-max", label: "מקסימום", amount: `₪${priceRange.max.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, onRemove: () => setPriceRange(null) },
    );
  }
  if (selectedBrand !== ALL_BRANDS_VALUE) {
    activeChips.push({
      key: "brand",
      label: brands?.find((b) => b.slug === selectedBrand)?.name ?? selectedBrand,
      onRemove: () => setSelectedBrand(ALL_BRANDS_VALUE),
    });
  }

  if (selectedCategory !== ALL_CATEGORIES_VALUE) {
    activeChips.push({
      key: "category",
      label: categories?.find((c) => normalizeSlug(c.slug) === selectedCategory)?.name ?? selectedCategory,
      onRemove: () => setSelectedCategory(ALL_CATEGORIES_VALUE),
    });
  }
  if (selectedCountry !== ALL_COUNTRIES_VALUE) {
    activeChips.push({
      key: "country",
      label: countries?.find((c) => c.slug === selectedCountry)?.name ?? selectedCountry,
      onRemove: () => setSelectedCountry(ALL_COUNTRIES_VALUE),
    });
  }

  function runQuery(after: string | null, append: boolean) {
    startTransition(async () => {
      const result = await fetchCategoryProducts({
        category: effectiveCategory,
        brand: effectiveBrand,
        country: selectedCountry === ALL_COUNTRIES_VALUE ? undefined : selectedCountry,
        search,
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
    // Mirror the filters into the address bar (no navigation, no server render).
    const nextSearch = writeUrlFilters(window.location.search, { sort, priceRange, brand: selectedBrand, country: selectedCountry, category: selectedCategory }, !categorySlug);
    if (nextSearch !== window.location.search) window.history.replaceState(null, "", `${window.location.pathname}${nextSearch}${window.location.hash}`);
    runQuery(null, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort, priceRange, selectedBrand, selectedCountry, selectedCategory]);

  // Opening a URL that already carries filters (shared link, or arriving from another
  // category with them): apply them — the state change re-runs the query above.
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- one-time sync from the URL (not readable during SSR without a hydration mismatch) */
    const f = readUrlFilters(window.location.search);
    if (f.sort !== "DEFAULT") setSort(f.sort);
    if (f.priceRange) setPriceRange(f.priceRange);
    if (f.brand !== ALL_BRANDS_VALUE) setSelectedBrand(f.brand);
    if (f.country !== ALL_COUNTRIES_VALUE) setSelectedCountry(f.country);
    if (!categorySlug && f.category !== ALL_CATEGORIES_VALUE) setSelectedCategory(f.category);
    /* eslint-enable react-hooks/set-state-in-effect */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function clearFilters() {
    setSort("DEFAULT");
    setPriceRange(null);
    setSelectedBrand(ALL_BRANDS_VALUE);
    setSelectedCountry(ALL_COUNTRIES_VALUE);
    setSelectedCategory(ALL_CATEGORIES_VALUE);
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

  // A page that opened with no products at all (unknown brand/category) has nothing to filter — hide the bar.
  // Filtering down to zero results later keeps it, so the filters can be undone.
  const noFilters = hideFilters || initialProducts.length === 0;
  const onCategoryPage = Boolean(categorySlug);
  const currentCategorySlug = categorySlug ? normalizeSlug(categorySlug) : null;
  // The page's own category when it's one of the options (i.e. not when the options are its children).
  // Falls back to the page's own title so the chip still shows (as on the reference) when it isn't an option.
  const currentCategoryName =
    categories?.find((c) => normalizeSlug(c.slug) === (currentCategorySlug ?? selectedCategory))?.name ?? categoryName;

  function pickCategory(slug: string) {
    if (!categories) return;
    if (!onCategoryPage) {
      // Brand page (as on the legacy site): the category opens its own page; the page's own brand
      // is NOT carried over — only filters the shopper actually applied are (a picked brand becomes filter_brand).
      if (!brandSlug) {
        setSelectedCategory(slug);
        return;
      }
      const target = categories.find((c) => normalizeSlug(c.slug) === slug);
      const q = new URLSearchParams(window.location.search);
      q.delete("product_cat");
      if (selectedBrand !== ALL_BRANDS_VALUE) q.set("filter_brand", selectedBrand);
      const qs = q.toString();
      router.push(`${target?.href ?? `/product-category/${slug}/`}${qs ? `?${qs}` : ""}`);
      return;
    }
    if (slug === currentCategorySlug) return;
    const target = categories.find((c) => normalizeSlug(c.slug) === slug);
    // Carry every active filter over to the other category's page.
    router.push(`${target?.href ?? `/product-category/${slug}/`}${window.location.search}`);
  }

  return (
    <div className="flex flex-col">
      {intro ? <div className="mb-[30px] max-md:order-2 max-md:mt-[20px] max-md:mb-0 max-md:[&_p:last-child]:mb-0">{intro}</div> : null}

      {/* Horizontal filter bar (reference: WoodMart product filters) —
          one dropdown per filter across the full width, above the grid.
          On mobile it collapses into a "סינון מוצרים" +/− accordion that sits above the description. */}
      {noFilters ? null : (
      <>
      <div className={`max-md:order-1 ${onCategoryPage ? "max-md:hidden" : ""}`}>
      <button
        type="button"
        aria-expanded={filtersOpen}
        onClick={() => {
          setFiltersSettled(false);
          setFiltersOpen((v) => !v);
        }}
        className="flex h-[46px] w-full cursor-pointer items-center justify-center gap-[8px] rounded-[4px] border border-[#d5d8dc] text-[16px] text-black md:hidden"
      >
        {filtersOpen ? <Minus className="h-4 w-4" strokeWidth={3} /> : <Plus className="h-4 w-4" strokeWidth={3} />}
        סינון מוצרים
      </button>
      {/* grid-rows 0fr → 1fr: the filters slide open/closed smoothly on mobile; always open on desktop. */}
      <div
        className={`grid transition-[grid-template-rows,visibility] duration-300 ease-in-out md:grid-rows-[1fr] ${
          filtersOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr] max-md:invisible"
        }`}
        onTransitionEnd={(e) => {
          if (e.target === e.currentTarget && e.propertyName === "grid-template-rows") setFiltersSettled(filtersOpen);
        }}
      >
      <div className={`min-h-0 md:overflow-visible ${filtersSettled ? "" : "overflow-hidden"}`}>
      <div className="grid grid-cols-2 gap-x-[20px] gap-y-[10px] max-md:pt-[15px] md:grid-cols-5">
        <FilterDropdown title="מיין לפי" value={sort !== "DEFAULT" ? SORT_OPTIONS.find((o) => o.value === sort)?.label : undefined}>
          {(close) => (
            <OptionList
              options={SORT_OPTIONS}
              selected={sort}
              onSelect={(v) => {
                setSort(v);
                close();
              }}
            />
          )}
        </FilterDropdown>

        {(categories && categories.length > 0) || currentCategoryName ? (
          <FilterDropdown title="קטגוריות" value={currentCategoryName}>
            {(close) => (
              <OptionList
                options={[
                  ...(categories ?? []).map((c) => ({ value: normalizeSlug(c.slug), label: c.name, depth: c.depth })),
                ]}
                selected={currentCategorySlug ?? selectedCategory}
                onSelect={(slug) => {
                  close();
                  pickCategory(slug);
                }}
              />
            )}
          </FilterDropdown>
        ) : null}

        <FilterDropdown title="מחיר" value={priceRange ? `${priceRange.min}–${priceRange.max} ₪` : undefined}>
          {(close) => (
            <div className="p-[15px]">
              <PriceRangeFilter
                min={priceRange?.min ?? priceBounds.min}
                max={priceRange?.max ?? priceBounds.max}
                boundMin={priceBounds.min}
                boundMax={priceBounds.max}
                onApply={(min, max) => {
                  setPriceRange({ min, max });
                  close();
                }}
              />
            </div>
          )}
        </FilterDropdown>

        {brands && brands.length > 0 ? (
          <FilterDropdown
            title="מותג"
            value={selectedBrand !== ALL_BRANDS_VALUE ? brands.find((b) => b.slug === selectedBrand)?.name : undefined}
          >
            {(close) => (
              <OptionList
                options={[
                  ...brands.map((b) => ({ value: b.slug, label: b.name, image: b.thumbnailUrl })),
                ]}
                selected={selectedBrand}
                onSelect={(v) => {
                  setSelectedBrand(v);
                  close();
                }}
              />
            )}
          </FilterDropdown>
        ) : null}

        {countries && countries.length > 0 ? (
          <FilterDropdown
            title="ארץ ייצור"
            value={selectedCountry !== ALL_COUNTRIES_VALUE ? countries.find((c) => c.slug === selectedCountry)?.name : undefined}
          >
            {(close) => (
              <OptionList
                options={[...countries.map((c) => ({ value: c.slug, label: c.name }))]}
                selected={selectedCountry}
                onSelect={(v) => {
                  setSelectedCountry(v);
                  close();
                }}
              />
            )}
          </FilterDropdown>
        ) : null}
      </div>
      </div>
      </div>
      </div>
      </>
      )}

      <div className={`max-md:order-3 ${noFilters ? "" : intro ? "mt-[35px] max-md:mt-[20px]" : "mt-[35px]"}`}>
        {activeChips.length > 0 ? (
          // Copied from the legacy Woodmart active-filters bar (measured: 14px/600, #333, red ₪-prefixed amounts).
          <div className="mb-[15px] flex flex-wrap items-center gap-x-[15px] gap-y-[10px] text-[14px] leading-none max-lg:flex-nowrap max-lg:overflow-x-auto max-lg:whitespace-nowrap">
            <button
              type="button"
              onClick={clearFilters}
              className="flex shrink-0 items-center border-e border-black/[0.105] pe-[15px] text-[14px] font-semibold leading-[2] text-[#333] transition-colors hover:text-[#777]"
            >
              <X className="me-[0.3em] h-[1em] w-[1em] font-normal" />
              ניקוי מסננים
            </button>
            {activeChips.map((chip) => (
              <button
                key={chip.key}
                type="button"
                onClick={chip.onRemove}
                className="flex shrink-0 items-center text-[14px] font-semibold leading-[2] text-[#333] transition-colors hover:text-[#777]"
              >
                <X className="me-[0.3em] h-[1em] w-[1em] font-normal" />
                {chip.label}
                {chip.amount ? <span dir="ltr" className="mr-[3px] text-[#d52027]">{chip.amount}</span> : null}
              </button>
            ))}
          </div>
        ) : null}

        {products.length === 0 && !isPending ? (
          <p className="py-10 text-center text-lg text-black/60">
            {search
              ? "לא נמצאו מוצרים התואמים לחיפוש."
              : brandSlug
                ? "אין מוצרים זמינים במותג זה כרגע."
                : "אין מוצרים זמינים בקטגוריה זו כרגע."}
          </p>
        ) : (
          // Shared 1px grid lines like the reference: each card draws a full
          // border and overlaps its neighbour by 1px (-mt-px/-ml-px), so the
          // container adds the outer top/left edge back.
          <div className="grid grid-cols-2 pt-px pl-px max-md:-mx-[10px] md:grid-cols-3 lg:grid-cols-5">
            {products.map((product) => (
              <CategoryProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* Infinite-scroll sentinel + the reference's loading pill. */}
        <div ref={sentinelRef} className="flex justify-center py-[11px]">
          {isPending && products.length > 0 ? (
            <span className="flex h-[44px] items-center gap-[8px] rounded-[35px] border-2 border-black/[.106] px-[25px] text-[13px] font-semibold text-[#333]">
              <Loader2 className="h-4 w-4 animate-spin" />
              בטעינה...
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
