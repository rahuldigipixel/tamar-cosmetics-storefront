import { cache } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { seoToMetadata, jsonLdString, breadcrumbJsonLd } from "@/lib/seo";
import { getCategoryPageData } from "@/lib/wpgraphql/categoryPage";
import { CategoryProductGrid } from "@/components/product/CategoryProductGrid";
import { FaqAccordion } from "@/components/product/FaqAccordion";
import { CategoryBanner } from "@/components/product/CategoryBanner";
import { CategoryCarousel } from "@/components/product/CategoryCarousel";

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

// One request per render for generateMetadata() + the page body (keyed by the URL path string, since
// getCategoryPageData() takes an array, which React cache() would compare by identity).
const loadCategoryPage = cache((pathKey: string) => {
 const parts = pathKey.split("/");
 return getCategoryPageData(parts[parts.length - 1], 20, parts.slice(0, -1));
});

const pathKeyOf = (slugPath: string[]) => slugPath.map(normalizeSlug).join("/");

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
 const { slug: slugPath } = await params;
 const data = await loadCategoryPage(pathKeyOf(slugPath));
 const name = data.info?.name;
 const meta = seoToMetadata(data.seo, {
 path: `/product-category/${slugPath.map(normalizeSlug).join("/")}/`,
 fallback: { title: name ? `${name} | תמר קוסמטיקס` : undefined, description: data.info?.description?.replace(/<[^>]+>/g, "").trim().slice(0, 160) || (name ? `${name} - מבחר מוצרים מקצועיים לקוסמטיקאיות, משלוח מהיר לכל הארץ. קנו אונליין בתמר קוסמטיקס.` : undefined) },
 });
 // Unknown category slugs still render the empty state — keep them out of the index.
 return name ? meta : { ...meta, robots: { index: false, follow: true } };
}

export default async function ProductCategoryPage({ params }: CategoryPageProps) {
 const { slug: slugPath } = await params;
 const activeSlug = normalizeSlug(slugPath[slugPath.length - 1]);

 // Products + full category list + full brand list + which brand slugs
 // appear in this category + this category's own name/description/banner
 // (via the plugin's tamarCategoryInfo GraphQL field), all in ONE combined
 // GraphQL request — see getCategoryPageData().
 const {
 products,
 hasNextPage,
 endCursor,
 categories: allCategories,
 brands,
 brandSlugsInCategory: brandsInCategorySlugs,
 countriesInCategory,
 info,
 breadcrumbCategories,
 priceBounds,
 } = await loadCategoryPage(pathKeyOf(slugPath));
 const banner = info?.banner ?? null;
 const carouselItems = info?.carousel ?? [];

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

 // A slug that isn't a category at all still opens the page, showing the
 // grid's "no products available" empty state (no 404). When the WordPress
 // lookup answered, it's authoritative (the products query ignores an unknown
 // category filter and returns unrelated products, so those are dropped);
 // if it failed/timed out, fall back to the older heuristics.
 const categoryMissing = info ? !info.name : !category && !categoryFromProducts && products.length === 0;
 const shownProducts = categoryMissing ? [] : products;

 const brandsInCategory = brands.filter((b) => brandsInCategorySlugs.has(b.slug));
 // Categories filter: this category's child categories when it has any,
 // otherwise the full category list. The client-side filter only needs
 // name/slug + the link to navigate to — drop the HTML descriptions.
 // Same rule as the live Categories filter: this category's sub-categories when it has any,
 // otherwise its siblings (the parent's sub-categories — or, for a top-level category, all
 // top-level categories).
 const childCategories = category ? allCategories.filter((c) => c.parentId === category.id) : [];
 const optionList =
 childCategories.length > 0 ? childCategories : allCategories.filter((c) => c.parentId === category?.parentId);
 const optionParentPath = childCategories.length > 0 ? slugPath : slugPath.slice(0, -1);
 const categoryOptions = optionList.map((c) => ({
 id: c.id,
 name: c.name,
 slug: c.slug,
 count: c.count,
 href: `/product-category/${[...optionParentPath, c.slug].join("/")}/`,
 }));

 const title =
 category?.name ?? info?.name ?? categoryFromProducts?.name ?? decodeURIComponent(activeSlug).replace(/-/g, " ");
 // Prefer the WordPress-rendered description (paragraphs/line breaks
 // applied, as on the reference); the GraphQL list one is raw text.
 const description = info?.description || category?.description || "";
 // Admin HTML saves one line per row and relies on wpautop() — newlines inside <p> (or plain text) become <br>, as on the brand page.
 const toBr = (t: string) => t.replace(/\r?\n/g, "<br />");
 const formatHtml = (raw: string) =>
 /<p\b/i.test(raw) ? raw.replace(/<p\b[^>]*>[\s\S]*?<\/p>/gi, toBr) : toBr(raw);
 const readMoreText = formatHtml(info?.readMore ?? "");
 const extraDescription = formatHtml(info?.extraDescription ?? "");
 const categoryBySlug = new Map(
 [...allCategories, ...breadcrumbCategories].map((c) => [normalizeSlug(c.slug), c.name])
 );
 const breadcrumbSlugs = slugPath.slice(0, -1).map(normalizeSlug);

 const breadcrumbLd = breadcrumbJsonLd([
 { name: "עמוד הבית", path: "/" },
 ...breadcrumbSlugs.map((s, i) => ({
 name: categoryBySlug.get(s) ?? s.replace(/-/g, " "),
 path: `/product-category/${breadcrumbSlugs.slice(0, i + 1).join("/")}/`,
 })),
 { name: title, path: `/product-category/${slugPath.map(normalizeSlug).join("/")}/` },
 ]);

 return (
 // Reference layout (tamarcosmetics.co.il/product-category/sale/, measured
 // at 1920px): full-width banner straight under the header → pink title
 // band (40px/700 #242424, 15px padding) → 12px breadcrumb → centered 21px
 // description → horizontal filter bar → product grid.
 <div>
 <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(breadcrumbLd) }} />
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
 {categoryBySlug.get(s) ?? s.replace(/-/g, " ")}
 </Link>
 </span>
 ))}
 <span>/</span>
 <span className="font-semibold text-[#333]">{title}</span>
 </nav>

 {/* Admin-managed circle carousel (category setting "Enable Category Carousel"), straight after the breadcrumb. */}
 {carouselItems.length > 0 ? <CategoryCarousel items={carouselItems} /> : null}

 {/* The description is rendered inside the grid component (as `intro`) so on mobile the filter accordion can sit above it. */}
 <div className={`mx-auto max-w-[1600px] px-[15px] ${description ? "pt-[15px] md:pt-[40px]" : "pt-[15px] md:pt-[30px]"} ${readMoreText || extraDescription ? "pb-0" : "pb-0 md:pb-12"}`}>
 <CategoryProductGrid
 intro={
 description ? (
 <div
 className="text-center text-[16px] leading-[26px] text-[#1f2124] md:text-[21px] md:leading-[33.6px] md:text-[#0c0c0c] [&_h1]:text-[26px] [&_h1]:font-bold [&_h2]:text-[24px] [&_h2]:font-bold [&_h3]:text-[22px] [&_h3]:font-semibold [&_h4]:text-[22px] [&_h4]:font-semibold [&_img]:mx-auto [&_p]:mb-[20px] [&_strong]:font-bold"
 dangerouslySetInnerHTML={{ __html: description }}
 />
 ) : null
 }
 categorySlug={activeSlug}
 initialProducts={shownProducts}
 initialHasNextPage={categoryMissing ? false : hasNextPage}
 initialEndCursor={categoryMissing ? null : endCursor}
 categories={categoryOptions}
 brands={brandsInCategory}
 countries={countriesInCategory}
 priceBounds={priceBounds}
 />
 </div>
 {/* Accordions after the product list, same as the brand page: "קרא עוד" above the FAQ one. */}
 {readMoreText || extraDescription ? (
 <div className="mx-auto max-w-[1600px] space-y-[9px] px-[15px] pb-[40px]">
 {readMoreText ? <FaqAccordion title="קרא עוד" html={readMoreText} /> : null}
 {extraDescription ? <FaqAccordion title="שאלות נפוצות" html={extraDescription} /> : null}
 </div>
 ) : null}
 </div>
 );
}
