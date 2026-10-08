import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getProductBySlug } from "@/lib/wpgraphql/products";
import { wpEnv } from "@/lib/wpgraphql/env";
import { seoToMetadata, jsonLdString, breadcrumbJsonLd, absoluteUrl, toDescription, priceValidUntil } from "@/lib/seo";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductTabs } from "@/components/product/ProductTabs";
import { ProductPurchasePanel } from "@/components/product/ProductPurchasePanel";
import { ProductShortDescription } from "@/components/product/ProductShortDescription";
import { QuickViewShare } from "@/components/product/QuickViewShare";
import { FlashyStarRating } from "@/components/product/FlashyStarRating";
import { ProductWishlistButton } from "@/components/product/ProductWishlistButton";
import { ProductFeatures } from "@/components/product/ProductFeatures";
import { TamarTip } from "@/components/product/TamarTip";
import { BrandTip } from "@/components/product/BrandTip";
import { LinkedProductsSlider } from "@/components/product/LinkedProductsSlider";
import { FlashyProductWidget } from "@/components/product/FlashyProductWidget";
import { FlashyViewContent } from "@/components/layout/FlashyTracker";
import { ProductIconStrip } from "@/components/product/ProductIconStrip";
import { FlashyReviewsWidget } from "@/components/reviews/FlashyReviewsWidget";
import { getGlobalData } from "@/lib/wpgraphql/tamarApi";
import { resolveIntegrations } from "@/lib/integrations";
import { ProductSlider } from "@/components/home/ProductSlider";
import { formatPrice } from "@/lib/utils/formatPrice";
import { Price } from "@/components/product/Price";
import { getUnitPrice } from "@/lib/utils/unitPrice";

export const revalidate = 60;

// No pages are pre-built, but declaring the params makes the route ISR: each product is rendered
// on first request, then served from the cache (CDN `s-maxage`) and refreshed every `revalidate` seconds.
export function generateStaticParams() {
  return [];
}

// Global attribute options fall back to their (percent-encoded) slug.
function humanizeOption(value: string) {
 try {
 return decodeURIComponent(value).replace(/-/g, " ").trim();
 } catch {
 return value;
 }
}

// Next.js has been observed delivering this dynamic segment in different
// forms to generateMetadata() vs. the page body for a non-ASCII slug (one
// still percent-encoded, the other already decoded) — same root cause as
// the fix in lib/wpgraphql/posts.ts's getPostBySlug. Since getProductBySlug
// is only React `cache()`-deduped for identical string arguments, normalizing
// here (not inside getProductBySlug) is what actually makes both call sites
// share one request instead of firing two GraphQL queries with different
// slug encodings.
function normalizeSlug(slug: string) {
 // WordPress stores non-ASCII slugs percent-encoded in lowercase hex, and
 // WPGraphQL's SLUG lookup only matches that exact form — not decoded Hebrew.
 try {
 return encodeURIComponent(decodeURIComponent(slug)).toLowerCase();
 } catch {
 return slug.toLowerCase();
 }
}

export async function generateMetadata({
 params,
}: {
 params: Promise<{ slug: string }>;
}): Promise<Metadata> {
 const { slug } = await params;
 const result = await getProductBySlug(normalizeSlug(slug));
 if (!result) return { title: "המוצר לא נמצא", robots: { index: false, follow: false } };
 const { product } = result;

 const plain = product.shortDescription?.replace(/<[^>]+>/g, "").trim();
 return seoToMetadata(result.seo, {
 path: `/product/${product.slug}`,
 ogType: "product",
 fallback: { title: `${product.name} | תמר קוסמטיקס`, description: plain ? toDescription(plain, 155) : undefined, image: product.images[0]?.src },
 });
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
 const { slug } = await params;
 const [result, global] = await Promise.all([getProductBySlug(normalizeSlug(slug)), getGlobalData()]);
 const integrations = resolveIntegrations(global?.settings);

 if (!result) notFound();
 const { product, related, upsells, pageSettings } = result;

 // Prefer the deepest category (one with a parent) so the breadcrumb reads home / parent / child / product.
 const primaryCategory = product.categories.find((c) => c.parent) ?? product.categories[0];
 const parentCategory = primaryCategory?.parent;
 const productUrl = `${wpEnv.siteUrl}/product/${product.slug}`;

 const breadcrumbLd = breadcrumbJsonLd([
 { name: "תמר קוסמטיקס", path: "/" },
 ...(parentCategory ? [{ name: parentCategory.name, path: `/product-category/${parentCategory.slug}/` }] : []),
 ...(primaryCategory
 ? [{ name: primaryCategory.name, path: `/product-category/${parentCategory ? `${parentCategory.slug}/` : ""}${primaryCategory.slug}/` }]
 : []),
 { name: product.name, path: `/product/${product.slug}` },
 ]);


 // Details shown under the SKU/barcode/brand lines: every visible attribute
 // except the brand (already its own line), e.g. כמות: 13 מ"ל.
 const attributeLines = product.attributes
 .filter((a) => !a.variation && !/מותג|brand/i.test(`${a.label} ${a.name}`))
 .map((a) => ({
 id: a.id,
 label: a.label || a.name,
 value: (a.optionNames?.length ? a.optionNames : a.options.map(humanizeOption)).join(", "),
 }))
 .filter((a) => a.value);

 const show = pageSettings.visibility;
 const unitPrice = show.unitPrice ? getUnitPrice(Number(product.price), product.attributes) : null;
 const showTip = show.tip && Boolean(product.tamarTip);
 const linkedProducts = product.sliderProducts ?? [];
 const showLinked = linkedProducts.length > 0;
 const showStrip = show.iconStrip && pageSettings.iconStrip.length > 0;
 const showSliders = show.complementary || show.similar || (show.upsells && upsells.length > 0) || (show.related && related.length > 0);
 const showFeatures = show.iconBoxes && pageSettings.features.length > 0;

 // The "מותג" attribute term is the product's real brand. `product.brand` /
 // `brandLogoUrl` come from the pa_brand taxonomy, whose WPGraphQL field
 // (allPaBrand) returns terms not necessarily assigned to this product — so
 // only trust that logo when there is no brand attribute to contradict it.
 const brandAttribute = product.attributes.find((a) => /מותג|brand/i.test(`${a.label} ${a.name}`));
 const brandName = brandAttribute?.optionNames?.[0] ?? product.brand;
 const brandSlug = brandAttribute?.optionSlugs?.[0] || undefined;

 const barcode = product.barcode?.replace(/D/g, "") ?? "";
 const jsonLd = {
 "@context": "https://schema.org",
 "@type": "Product",
 "@id": `${absoluteUrl(`/product/${product.slug}`)}#product`,
 name: product.name,
 image: product.images.map((img) => (/^https?:\/\//i.test(img.src) ? img.src : absoluteUrl(img.src))),
 description: toDescription(product.shortDescription, 300) || undefined,
 sku: product.sku ?? String(product.databaseId),
 mpn: product.sku ?? undefined,
 gtin: barcode.length >= 8 && barcode.length <= 14 ? barcode : undefined,
 brand: brandName ? { "@type": "Brand", name: brandName } : undefined,
 category: primaryCategory?.name,
 aggregateRating:
 product.reviewCount && product.reviewCount > 0 && product.averageRating
 ? { "@type": "AggregateRating", ratingValue: Number(product.averageRating.toFixed(1)), reviewCount: product.reviewCount }
 : undefined,
 offers: {
 "@type": "Offer",
 url: absoluteUrl(`/product/${product.slug}`),
 priceCurrency: product.currency,
 price: product.onSale && product.salePrice ? product.salePrice : product.price,
 priceValidUntil: priceValidUntil(),
 itemCondition: "https://schema.org/NewCondition",
 availability: product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
 seller: { "@type": "Organization", name: "תמר קוסמטיקס" },
 },
 };
 // pa_term_hint of the brand term → "?" tooltip next to the brand; hidden when empty.
 const brandTipText = show.brandTip ? brandAttribute?.optionHints?.[0]?.trim() || undefined : undefined;
 const regularNum = Number(product.regularPrice);
 const saleNum = Number(product.salePrice);
 const discount = product.onSale && regularNum > 0 && saleNum > 0 && saleNum < regularNum ? Math.round(((regularNum - saleNum) / regularNum) * 100) : null;
 const brandLogoUrl = brandAttribute?.optionNames?.length ? (brandAttribute.optionImages?.[0] ?? undefined) : product.brandLogoUrl;

 const brandLogoImage = brandLogoUrl ? (
 <Image
 src={brandLogoUrl}
 alt={brandName ?? ""}
 width={140}
 height={70}
 className="h-auto w-auto max-h-[45px] max-w-[69px] object-contain object-center opacity-90 md:max-h-none md:max-w-[88px] md:opacity-100"
 />
 ) : null;
 // Logo above the title links to the brand's product list.
 const brandLogo = brandLogoImage ? (
 brandSlug ? (
 <Link href={`/brand/${brandSlug}/`} className="mb-[15px] block w-fit" aria-label={brandName}>
 {brandLogoImage}
 </Link>
 ) : (
 <div className="mb-[15px]">{brandLogoImage}</div>
 )
 ) : null;

 const metaBlock = (
 <div className="mt-[20px] space-y-[7px] text-[15px] leading-[24px] text-[#0c0c0c] md:text-[16px]" style={{ fontFamily: '"Open Sans Hebrew", sans-serif' }}>
 {product.sku ? (
 <p>
 <span className="text-[#0c0c0c]">מק&quot;ט:</span> {product.sku}
 </p>
 ) : null}
 {show.barcode && product.barcode ? (
 <p>
 <span className="text-[#0c0c0c]">ברקוד:</span> {product.barcode}
 </p>
 ) : null}
 {brandName ? (
 <p>
 <span className="text-[#0c0c0c]">מותג:</span> {brandName}
 {brandTipText ? <> <BrandTip text={brandTipText} /></> : null}
 </p>
 ) : null}
 {attributeLines.map((a) => (
 <p key={a.id}>
 <span className="text-[#0c0c0c]">{a.label}:</span> {a.value}
 </p>
 ))}
 </div>
 );

 const shareBlock = show.share ? (
 <div className="mt-[15px] border-t border-black/10 pt-[15px] md:mt-[20px]">
 <QuickViewShare url={productUrl} title={product.name} image={product.images[0]?.src} label="שיתוף:" />
 </div>
 ) : null;

 return (
 <div>
 {/* React hoists these <meta> tags into <head>; Next's metadata API can't emit og:type=product or property-based product tags. */}
 <meta property="og:type" content="product" />
 <meta property="product:price:amount" content={String(jsonLd.offers.price)} />
 <meta property="product:price:currency" content={product.currency} />
 <meta property="product:availability" content={product.inStock ? "in stock" : "out of stock"} />
 <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }} />
 <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(breadcrumbLd) }} />

 {/* Same full-width container as the header/home sections. Font sizes on this page follow the legacy site (approved exception to the 18px floor). */}
 <div className="mx-auto max-w-[1600px] px-[8px] pt-[12px] pb-[25px] md:px-[15px]">
 {/* RTL grid: column 1 is the right-hand side. Mobile stacks breadcrumb → gallery → details → features. */}
 <div className="grid gap-x-[80px] gap-y-[4px] md:gap-y-[15px] md:grid-cols-2 md:items-start xl:grid-cols-[550px_640px_356px] xl:gap-x-[15px]">
 <nav aria-label="breadcrumb" className="hidden flex-wrap items-center md:flex gap-x-[5px] text-[12px] leading-[19px] text-[#555] md:col-span-2 md:col-start-1 md:row-start-1 xl:col-span-3">
 <Link href="/" className="hover:text-brand-accent">
 עמוד הבית
 </Link>
 {parentCategory ? (
 <>
 <span>/</span>
 <Link href={`/product-category/${parentCategory.slug}/`} prefetch={false} className="hover:text-brand-accent">
 {parentCategory.name}
 </Link>
 </>
 ) : null}
 {primaryCategory ? (
 <>
 <span>/</span>
 <Link
 href={`/product-category/${parentCategory ? `${parentCategory.slug}/` : ""}${primaryCategory.slug}/`}
 prefetch={false}
 className="hover:text-brand-accent"
 >
 {primaryCategory.name}
 </Link>
 </>
 ) : null}
 <span>/</span>
 <span className="font-semibold text-[#333]">{product.name}</span>
 </nav>

 {/* Mobile only: title sits above the gallery (desktop keeps it in the details column). */}
 <div className="md:hidden">
 <h1 className="text-right text-[24px] leading-[29px] font-bold text-black">{product.name}</h1>
 <div className="mt-[6px] [&>*]:!mb-0">{brandLogo}</div>
 </div>

 <div className="mx-auto w-full max-w-[500px] xl:max-w-[640px] xl:sticky xl:top-[100px] xl:px-[70px] xl:py-[10px] md:col-start-2 md:row-start-2 md:mx-0 xl:mx-auto xl:col-start-2">
 <ProductGallery images={product.images} name={product.name} brandName={brandName} brandLogoUrl={brandLogoUrl} labelsHtml={product.labelsHtml?.image} discount={discount} price={product.price} />
 </div>

 <div className="px-0 text-right md:px-[10px] md:col-start-1 md:row-start-2">
 <div className="hidden md:block">{brandLogo}</div>

 {/* The mobile <h1> above is the only real h1 in the DOM; this desktop variant is a level-1 heading role so crawlers see one <h1>. */}
 <div role="heading" aria-level={1} className="hidden md:block md:text-[34px] md:leading-[41px] md:font-normal text-black">{product.name}</div>

 <FlashyStarRating rating={product.averageRating} count={product.reviewCount} />

 {product.shortDescription ? <ProductShortDescription html={product.shortDescription} /> : null}

 <div className="hidden md:block">{metaBlock}</div>

 <div className="mt-[25px] flex items-center justify-between gap-4">
 <div className="flex flex-wrap items-baseline gap-x-[12px]">
 {product.onSale && product.salePrice ? (
 <>
 <span className="text-[38px] leading-none font-bold text-brand-accent md:text-[48px]">
 <Price value={product.salePrice} currency={product.currency} />
 </span>
 <span className="relative text-[30px] font-light leading-[30px] text-[#414141] after:absolute after:inset-x-0 after:top-1/2 after:h-px after:bg-[#414141] after:content-[''] [unicode-bidi:isolate]">
 <Price value={product.regularPrice} currency={product.currency} symbolSize={26} />
 </span>
 </>
 ) : (
 <span className="text-[38px] leading-none font-bold text-black md:text-[48px]">
 <Price value={product.price} currency={product.currency} />
 </span>
 )}
 </div>
 <ProductWishlistButton productId={product.databaseId} />
 </div>

 <ProductPurchasePanel productId={product.databaseId} inStock={product.inStock} />

 {show.coupon && product.coupon ? (
 <p className="mt-[15px] border-2 md:mt-[22px] border-brand-accent px-[8px] py-[5px] text-center text-[14px] leading-[22px] font-normal text-brand-accent">
 <span dir="rtl">השתמש בקוד</span> <strong className="font-bold ">{product.coupon.code}</strong>
 {product.coupon.label ? (
 <>
 <span className="mx-[8px] text-black/40">|</span>
 <span dir="ltr">{product.coupon.label}</span>
 </>
 ) : null}
 </p>
 ) : null}

 {unitPrice ? (
 <p className="mt-[20px] text-[13px] text-black">
 {unitPrice.label} {formatPrice(unitPrice.value, product.currency)}
 </p>
 ) : null}

 {product.videoUrl ? (
 <video controls className="mt-6 w-full rounded-lg" src={product.videoUrl} />
 ) : null}

 <div className="hidden md:block">{shareBlock}</div>
 </div>

 <div className={`max-md:mt-[11px] md:col-span-2 md:row-start-3 xl:col-span-1 xl:col-start-3 xl:row-start-2 xl:px-[10px] ${showLinked || showTip || showFeatures ? "" : "md:hidden"}`}>
 {/* Without a tip the icons start lower, level with the gallery image. */}
 <div className={showLinked || showTip ? "space-y-[18px]" : ""}>
 {showLinked ? <LinkedProductsSlider products={linkedProducts} /> : null}
 {showTip && product.tamarTip ? <TamarTip text={product.tamarTip} /> : null}
 {/* Mobile only: SKU / barcode / attributes / share sit between the tip and the feature icons. */}
 <div className="-mb-[3px] md:hidden">
 {metaBlock}
 {shareBlock}
 </div>
 {showFeatures ? <div className="hidden md:block"><ProductFeatures features={pageSettings.features} /></div> : null}
 </div>
 </div>
 </div>

 <ProductTabs
 description={product.description}
 attributes={product.attributes}
 tabs={product.tabs}
 aboutBrand={show.aboutBrandTab ? { html: brandAttribute?.optionDescriptions?.[0] ?? "" } : undefined}
 shippingReturnsHtml={show.shippingTab ? pageSettings.shippingReturns : undefined}
 />
 {/* Mobile only: feature icons sit after the tabs (desktop keeps them in the right column). */}
 {showFeatures ? <div className="mt-[15px] md:hidden"><ProductFeatures features={pageSettings.features} /></div> : null}
 </div>

 {/* Flashy customer reviews for this product (same widget as /reviews, filtered by data-item-id). */}
 <section className="mx-auto w-full max-w-[1400px] px-2 pt-[30px] pb-[8px] sm:px-6 md:py-[30px]">
 <FlashyReviewsWidget itemId={product.databaseId} elementId={integrations.flashyReviewsElementId} legacyOrigin={integrations.flashyLegacySiteOrigin} />
 </section>

 {showStrip ? <ProductIconStrip items={pageSettings.iconStrip} /> : null}

 <FlashyViewContent productId={product.databaseId} />
 {showSliders ? (
 <div className="space-y-[10px] py-[15px] md:space-y-[30px] md:py-[50px]">
 {show.complementary ? <FlashyProductWidget kind="complementary" productId={product.databaseId} /> : null}

 {show.upsells && upsells.length > 0 ? (
 <ProductSlider title="מוצרים נוספים" products={upsells} compact />
 ) : null}

 {show.similar ? <FlashyProductWidget kind="similar" productId={product.databaseId} /> : null}

 {show.related && related.length > 0 ? <ProductSlider title="לקוחות שקנו גם" products={related} compact /> : null}
 </div>
 ) : null}
 </div>
 );
}
