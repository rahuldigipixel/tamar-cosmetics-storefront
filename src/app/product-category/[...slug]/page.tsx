import Link from "next/link";
import { notFound } from "next/navigation";
import { listProducts } from "@/lib/wpgraphql/products";
import { listCategories } from "@/lib/wpgraphql/categories";
import { listBrands, listBrandSlugsInCategory } from "@/lib/wpgraphql/brands";
import { CategoryProductGrid } from "@/components/product/CategoryProductGrid";
import { CategoryBanner } from "@/components/product/CategoryBanner";
import { getCategoryInfo } from "@/lib/wpgraphql/tamarApi";

export const revalidate = 60;

interface CategoryPageProps {
 params: Promise<{ slug: string[] }>;
}

// Hebrew URL segments can reach this page still percent-encoded (observed
// for nested /parent/child/ paths — Next.js doesn't reliably decode every
// catch-all segment) and/or under a different Unicode normalization form
// than the plain text WPGraphQL returns for `slug` (visually identical,
// byte-different). A bare `===` silently never matches either way, which
// was breaking the category lookup below (title, image, and description
// all fell back to a crude decoded-slug guess) even though the separate
// product-list query still matched fine server-side. decodeURIComponent()
// is a no-op on already-decoded text, so it's safe to always apply.
function normalizeSlug(slug: string) {
 try {
 return decodeURIComponent(slug).normalize("NFC");
 } catch {
 return slug.normalize("NFC");
 }
}

export default async function ProductCategoryPage({ params }: CategoryPageProps) {
 const { slug: slugPath } = await params;
 const activeSlug = normalizeSlug(slugPath[slugPath.length - 1]);

 const [{ products, hasNextPage, endCursor }, allCategories, brands, brandsInCategorySlugs, info] = await Promise.all([
 listProducts({ category: activeSlug, first: 20 }),
 listCategories().catch(() => []),
 listBrands().catch(() => []),
 // The Brand filter should only offer brands that actually have a
 // product in this category.
 listBrandSlugsInCategory(activeSlug).catch(() => new Set<string>()),
 // Name/description/banners for this one category, resolved server-side
 // by WordPress — works for every category, including empty ones the
 // GraphQL list above (hideEmpty) never contains.
 getCategoryInfo(activeSlug),
 ]);
 const banner = info?.banner ?? null;

 // Sourced from the same full category list that powers the header's
 // brands mega-menu (rather than a dedicated by-slug lookup query) —
 // WPGraphQL's productCategories(where: { slug }) unreliably returns null
 // for child categories, while this list is already known-good.
 const category = allCategories.find((c) => normalizeSlug(c.slug) === activeSlug) ?? null;

 // Fallback for when even that list-based lookup misses (seen in practice
 // for some child categories despite the slug normalization above) — the
 // products query, run against this exact slug, is proof positive of a
 // match, and each product carries its own categories with name+slug. No
 // image/description this way, but the real name beats the raw-slug guess.
 const categoryFromProducts = category
 ? null
 : products.flatMap((p) => p.categories).find((c) => normalizeSlug(c.slug) === activeSlug) ?? null;

 // 404 only for a slug that isn't a category at all — an existing category
 // with no products still opens, showing the grid's empty state. When the
 // WordPress lookup answered, it's authoritative (the products query
 // ignores an unknown category filter and returns unrelated products);
 // if it failed/timed out, fall back to the older heuristics.
 if (info ? !info.name : !category && !categoryFromProducts && products.length === 0) notFound();

 const brandsInCategory = brands.filter((b) => brandsInCategorySlugs.has(b.slug));
 // The client-side filter only needs id/name/slug/parent — drop the HTML
 // descriptions of every category from the serialized props.
 const categoryOptions = allCategories.map((c) => ({ ...c, description: undefined }));

 const title =
 category?.name ?? info?.name ?? categoryFromProducts?.name ?? decodeURIComponent(activeSlug).replace(/-/g, " ");
 // Prefer the WordPress-rendered description (paragraphs/line breaks
 // applied, as on the reference); the GraphQL list one is raw text.
 const description = info?.description || category?.description || "";
 const categoryBySlug = new Map(allCategories.map((c) => [normalizeSlug(c.slug), c.name]));
 const breadcrumbSlugs = slugPath.slice(0, -1).map(normalizeSlug);

 return (
 // Reference layout (tamarcosmetics.co.il/product-category/sale/, measured
 // at 1920px): full-width banner straight under the header → pink title
 // band (40px/700 #242424, 15px padding) → 12px breadcrumb → centered 21px
 // description → horizontal filter bar → product grid.
 <div className="font-['Open_Sans_Hebrew',Arial,Helvetica,sans-serif]">
 {banner ? <CategoryBanner banner={banner} title={title} /> : null}

 <div className="bg-[#fde7eb] px-[15px] py-[15px] text-center">
 <h1 className="text-[28px] font-bold leading-[1.2] text-[#242424] md:text-[40px] md:leading-[48px]">{title}</h1>
 </div>

 <nav
 aria-label="breadcrumb"
 className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-[6px] px-[15px] py-[8px] text-[12px] leading-[19px] text-[#333]"
 >
 <Link href="/" className="text-[#777] transition-colors hover:text-[#333]">
 עמוד הבית
 </Link>
 {breadcrumbSlugs.map((s, i) => (
 <span key={s} className="flex items-center gap-[6px]">
 <span>/</span>
 <Link
 href={`/product-category/${breadcrumbSlugs.slice(0, i + 1).join("/")}/`}
 className="text-[#777] transition-colors hover:text-[#333]"
 >
 {categoryBySlug.get(s) ?? decodeURIComponent(s)}
 </Link>
 </span>
 ))}
 <span>/</span>
 <span>{title}</span>
 </nav>

 {description ? (
 <div className="mx-auto max-w-[1600px] px-[15px] pt-[40px]">
 <div
 className="text-center text-[18px] leading-[1.6] text-[#0c0c0c] md:text-[21px] md:leading-[33.6px] [&_h1]:text-[26px] [&_h1]:font-bold [&_h2]:text-[24px] [&_h2]:font-bold [&_h3]:text-[22px] [&_h3]:font-semibold [&_h4]:text-[22px] [&_h4]:font-semibold [&_img]:mx-auto [&_p]:mb-[20px] [&_strong]:font-bold"
 dangerouslySetInnerHTML={{ __html: description }}
 />
 </div>
 ) : null}

 <div className="mx-auto max-w-[1600px] px-[15px] pt-[30px] pb-12">
 <CategoryProductGrid
 categorySlug={activeSlug}
 initialProducts={products}
 initialHasNextPage={hasNextPage}
 initialEndCursor={endCursor}
 categories={categoryOptions}
 brands={brandsInCategory}
 />
 </div>
 </div>
 );
}
