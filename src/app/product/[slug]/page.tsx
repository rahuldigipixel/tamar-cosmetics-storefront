import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getProductBySlug } from "@/lib/wpgraphql/products";
import { wpEnv } from "@/lib/wpgraphql/env";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductTabs } from "@/components/product/ProductTabs";
import { ProductPurchasePanel } from "@/components/product/ProductPurchasePanel";
import { ProductShortDescription } from "@/components/product/ProductShortDescription";
import { QuickViewShare } from "@/components/product/QuickViewShare";
import { FlashyStarRating } from "@/components/product/FlashyStarRating";
import { ProductWishlistButton } from "@/components/product/ProductWishlistButton";
import { ProductFeatures } from "@/components/product/ProductFeatures";
import { TamarTip } from "@/components/product/TamarTip";
import { FlashyProductWidget } from "@/components/product/FlashyProductWidget";
import { ProductIconStrip } from "@/components/product/ProductIconStrip";
import { ProductSlider } from "@/components/home/ProductSlider";
import { formatPrice } from "@/lib/utils/formatPrice";
import { getUnitPrice } from "@/lib/utils/unitPrice";

export const revalidate = 60;

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
 try {
 return decodeURIComponent(slug);
 } catch {
 return slug;
 }
}

export async function generateMetadata({
 params,
}: {
 params: Promise<{ slug: string }>;
}): Promise<Metadata> {
 const { slug } = await params;
 const result = await getProductBySlug(normalizeSlug(slug));
 if (!result) return {};
 const { product } = result;

 const url = `${wpEnv.siteUrl}/product/${product.slug}`;
 const image = product.images[0]?.src;

 return {
 title: `${product.name} | תמר קוסמטיקס`,
 description: product.shortDescription?.replace(/<[^>]+>/g, "").slice(0, 160),
 alternates: { canonical: url },
 openGraph: {
 title: product.name,
 description: product.shortDescription?.replace(/<[^>]+>/g, "").slice(0, 160),
 url,
 locale: "he_IL",
 type: "website",
 images: image ? [{ url: image }] : undefined,
 },
 };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
 const { slug } = await params;
 const result = await getProductBySlug(normalizeSlug(slug));

 if (!result) notFound();
 const { product, related, upsells, pageSettings } = result;

 const primaryCategory = product.categories[0];
 const productUrl = `${wpEnv.siteUrl}/product/${product.slug}`;

 const jsonLd = {
 "@context": "https://schema.org",
 "@type": "Product",
 name: product.name,
 image: product.images.map((img) => img.src),
 description: product.shortDescription?.replace(/<[^>]+>/g, ""),
 sku: product.sku ?? String(product.databaseId),
 offers: {
 "@type": "Offer",
 url: productUrl,
 priceCurrency: product.currency,
 price: product.onSale && product.salePrice ? product.salePrice : product.price,
 availability: product.inStock
 ? "https://schema.org/InStock"
 : "https://schema.org/OutOfStock",
 },
 };

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
 const brandLogoUrl = brandAttribute?.optionNames?.length ? (brandAttribute.optionImages?.[0] ?? undefined) : product.brandLogoUrl;

 const brandLogoImage = brandLogoUrl ? (
 <Image
 src={brandLogoUrl}
 alt={brandName ?? ""}
 width={110}
 height={30}
 className="h-[30px] w-auto max-w-[110px] object-contain object-right"
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

 return (
 <div>
 <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

 {/* Same full-width container as the header/home sections. Font sizes on this page follow the legacy site (approved exception to the 18px floor). */}
 <div className="mx-auto max-w-[1600px] px-[15px] py-[25px]">
 {/* RTL grid: column 1 is the right-hand side. Mobile stacks breadcrumb → gallery → details → features. */}
 <div className="grid gap-x-[80px] gap-y-[25px] md:grid-cols-2 md:items-start xl:grid-cols-[520px_500px_minmax(0,1fr)]">
 <nav className="flex flex-wrap items-center gap-x-[8px] text-[13px] leading-[19px] text-[#777] md:col-start-1 md:row-start-1">
 <Link href="/" className="hover:text-brand-accent">
 עמוד הבית
 </Link>
 {primaryCategory ? (
 <>
 <span>/</span>
 <Link href={`/product-category/${primaryCategory.slug}/`} className="hover:text-brand-accent">
 {primaryCategory.name}
 </Link>
 </>
 ) : null}
 <span>/</span>
 <span className="font-bold text-black">{product.name}</span>
 </nav>

 <div className="mx-auto w-full max-w-[500px] md:col-start-2 md:row-span-2 md:row-start-1 md:mx-0 xl:col-start-2">
 <ProductGallery images={product.images} name={product.name} brandName={brandName} brandLogoUrl={brandLogoUrl} />
 </div>

 <div className="text-right md:col-start-1 md:row-start-2">
 {brandLogo}

 <h1 className="text-[34px] leading-[1.25] font-normal text-[#242424]">{product.name}</h1>

 <FlashyStarRating productId={product.databaseId} />

 {product.shortDescription ? <ProductShortDescription html={product.shortDescription} /> : null}

 <div className="mt-[20px] space-y-[7px] text-[15px] leading-[24px] text-black">
 {product.sku ? (
 <p>
 <span className="text-[#555]">מק&quot;ט:</span> {product.sku}
 </p>
 ) : null}
 {show.barcode && product.barcode ? (
 <p>
 <span className="text-[#555]">ברקוד:</span> {product.barcode}
 </p>
 ) : null}
 {brandName ? (
 <p>
 <span className="text-[#555]">מותג:</span> {brandName}
 </p>
 ) : null}
 {attributeLines.map((a) => (
 <p key={a.id}>
 <span className="text-[#555]">{a.label}:</span> {a.value}
 </p>
 ))}
 </div>

 <div className="mt-[25px] flex items-center justify-between gap-4">
 <div className="flex flex-wrap items-baseline gap-x-[12px]">
 {product.onSale && product.salePrice ? (
 <>
 <span className="text-[44px] leading-none font-bold text-brand-accent">
 {formatPrice(product.salePrice, product.currency)}
 </span>
 <span className="text-[18px] text-black/50 line-through">
 {formatPrice(product.regularPrice, product.currency)}
 </span>
 </>
 ) : (
 <span className="text-[44px] leading-none font-bold text-black">
 {formatPrice(product.price, product.currency)}
 </span>
 )}
 </div>
 <ProductWishlistButton productId={product.databaseId} />
 </div>

 <ProductPurchasePanel productId={product.databaseId} inStock={product.inStock} />

 {show.coupon && product.coupon ? (
 <p className="mt-[12px] border-2 rounded-lg border-brand-accent px-[8px] py-[4px] text-center text-[14px] leading-[18px] text-brand-accent">
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

 {show.share ? (
 <div className="mt-[20px] border-t border-black/10 pt-[15px]">
 <QuickViewShare url={productUrl} title={product.name} image={product.images[0]?.src} label="שיתוף:" />
 </div>
 ) : null}
 </div>

 {showTip || showFeatures ? (
 <div className="md:col-span-2 md:row-start-3 xl:col-span-1 xl:col-start-3 xl:row-span-2 xl:row-start-1">
 {/* Without a tip the icons start lower, level with the gallery image. */}
 <div className={showTip ? "space-y-[30px]" : "xl:pt-[40px]"}>
 {showTip && product.tamarTip ? <TamarTip text={product.tamarTip} /> : null}
 {showFeatures ? <ProductFeatures features={pageSettings.features} /> : null}
 </div>
 </div>
 ) : null}
 </div>

 <ProductTabs description={product.description} attributes={product.attributes} tabs={product.tabs} />
 </div>

 {showStrip ? <ProductIconStrip items={pageSettings.iconStrip} /> : null}

 {showSliders ? (
 <div className="space-y-[30px] py-[50px]">
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
