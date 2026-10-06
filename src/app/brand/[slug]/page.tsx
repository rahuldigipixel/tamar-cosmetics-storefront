import Link from "next/link";
import { notFound } from "next/navigation";
import { FaqAccordion } from "@/components/product/FaqAccordion";
import { getBrandPageData } from "@/lib/wpgraphql/brandPage";
import { CategoryBanner } from "@/components/product/CategoryBanner";
import { CategoryProductGrid } from "@/components/product/CategoryProductGrid";

export const revalidate = 60;

interface BrandPageProps {
 params: Promise<{ slug: string }>;
}

export default async function BrandPage({ params }: BrandPageProps) {
 const { slug } = await params;
 const activeSlug = decodeURIComponent(slug).normalize("NFC");

 // Brand + first page of products + the filter-bar options, in one GraphQL request.
 const { brand, products, hasNextPage, endCursor, categories, brands, countries } = await getBrandPageData(activeSlug, 20);

 if (!brand) notFound();

 // The wp-admin editor saves single newlines inside a <p> (one line per
 // row) and relies on WordPress's wpautop() to turn them into <br> — do the
 // same here: newlines inside <p>…</p> (or in tag-less plain text) become
 // <br>, newlines between blocks are left alone.
 const toBr = (s: string) => s.replace(/\r?\n/g, "<br />");
 const formatHtml = (raw: string) =>
 /<p\b/i.test(raw) ? raw.replace(/<p\b[^>]*>[\s\S]*?<\/p>/gi, toBr) : toBr(raw);
 const banner = brand.desktopBannerUrl || brand.mobileBannerUrl
 ? {
 desktop: brand.desktopBannerUrl
 ? { url: brand.desktopBannerUrl, width: brand.desktopBannerWidth ?? 1920, height: brand.desktopBannerHeight ?? 600, alt: brand.name }
 : null,
 mobile: brand.mobileBannerUrl
 ? { url: brand.mobileBannerUrl, width: brand.mobileBannerWidth ?? 800, height: brand.mobileBannerHeight ?? 800, alt: brand.name }
 : null,
 }
 : null;
 const description = formatHtml(brand.description ?? "");
 const extraDescription = formatHtml(brand.extraDescription ?? "");
 const readMoreText = formatHtml(brand.categoryExtraDescriptionText ?? "");

 return (
 <div>
 {/* Full-width banner straight under the header, same as the category page. */}
 {banner ? <CategoryBanner banner={banner} title={brand.name} /> : null}

 {/* Same title band + breadcrumb as the product-category page, then the
 brand's logo and description centered (matches the reference brand page). */}
 <div className="bg-[#fde7eb] px-[15px] py-[15px] text-center">
 <h1 className="text-[28px] font-bold leading-[1.2] text-[#242424] md:text-[40px] md:leading-[48px]">{brand.name}</h1>
 </div>

 <nav
 aria-label="breadcrumb"
 className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-[6px] px-[15px] py-[8px] text-[12px] font-normal leading-[19px] text-[#333]"
 >
 <Link href="/" className="text-[#555] transition-colors hover:text-[#333]">
 עמוד הבית
 </Link>
 <span>/</span>
 <span className="font-semibold text-[#333]">{brand.name}</span>
 </nav>

 {/* The description is the rich-text editor HTML from wp-admin (the logo
 image lives inside it), so no separate thumbnail is rendered. It is passed to
 the grid as `intro` so on mobile the filter accordion can sit above it. */}
 <div className="mx-auto max-w-[1600px] px-[15px] pt-[15px] pb-0 md:pb-12 md:pt-[30px]">
 <CategoryProductGrid
 intro={
 description ? (
 <div
 className="w-full text-center font-normal text-[16px] leading-[26px] text-[#1f2124] md:text-[21px] md:leading-[33.6px] md:text-[#0c0c0c] [&_img]:mx-auto [&_img]:inline-block [&_p]:mb-[20px] [&_strong]:font-bold"
 dangerouslySetInnerHTML={{ __html: description }}
 />
 ) : null
 }
 brandSlug={activeSlug}
 initialProducts={products}
 initialHasNextPage={hasNextPage}
 initialEndCursor={endCursor}
 categories={categories}
 brands={brands}
 countries={countries}
 />
 </div>

 {/* Extra FAQ Description: one collapsed "שאלות נפוצות" accordion after the
 product list (smooth open/close). */}
 {readMoreText || extraDescription ? (
 <div className="mx-auto max-w-[1600px] space-y-[9px] px-[15px] pb-12">
 {/* "קרא עוד" accordion (term meta category_extra_description_text) sits above the FAQ one. */}
 {readMoreText ? <FaqAccordion title="קרא עוד" html={readMoreText} contentClassName="text-[16px] leading-[26px] text-[#1f2124]" /> : null}
 {extraDescription ? <FaqAccordion title="שאלות נפוצות" html={extraDescription} /> : null}
 </div>
 ) : null}
 </div>
 );
}
