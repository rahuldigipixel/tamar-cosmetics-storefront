import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles, Star } from "lucide-react";
import { getProductBySlug, listProducts } from "@/lib/wpgraphql/products";
import { wpEnv } from "@/lib/wpgraphql/env";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductTabs } from "@/components/product/ProductTabs";
import { ProductPurchasePanel } from "@/components/product/ProductPurchasePanel";
import { ProductShortDescription } from "@/components/product/ProductShortDescription";
import { SocialShare } from "@/components/product/SocialShare";
import { FeatureStrip } from "@/components/home/FeatureStrip";
import { ProductSlider } from "@/components/home/ProductSlider";
import { formatPrice } from "@/lib/utils/formatPrice";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};

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
  const product = await getProductBySlug(slug);

  if (!product) notFound();

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

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6">
        <nav className="mb-4 flex flex-wrap items-center gap-1 text-base text-black/50">
          <Link href="/" className="hover:text-brand-accent">
            בית
          </Link>
          {primaryCategory ? (
            <span className="flex items-center gap-1">
              <span>/</span>
              <Link href={`/product-category/${primaryCategory.slug}/`} className="hover:text-brand-accent">
                {primaryCategory.name}
              </Link>
            </span>
          ) : null}
          <span>/</span>
          <span className="text-black">{product.name}</span>
        </nav>

        <div className="grid gap-10 md:grid-cols-2 md:gap-10 lg:gap-14">
          <div className="mx-auto w-full max-w-[550px]">
            <ProductGallery
              images={product.images}
              name={product.name}
              productId={product.databaseId}
              brandName={product.brand}
              brandLogoUrl={product.brandLogoUrl}
            />
          </div>

          <div className="text-right">
            {product.brand ? (
              <p className="text-base font-bold uppercase tracking-wide text-black/60">{product.brand}</p>
            ) : null}

            <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">{product.name}</h1>

            {product.reviewCount ? (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex items-center gap-0.5" aria-label={`${product.averageRating} מתוך 5 כוכבים`}>
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.round(product.averageRating ?? 0)
                          ? "fill-brand-accent text-brand-accent"
                          : "fill-black/10 text-black/10"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-base text-black/50">({product.reviewCount})</span>
              </div>
            ) : null}

            {product.shortDescription ? <ProductShortDescription html={product.shortDescription} /> : null}

            {product.sku ? <p className="mt-3 text-base text-black/50">מק&quot;ט: {product.sku}</p> : null}
            {product.brand ? <p className="mt-1 text-base text-black/50">מותג: {product.brand}</p> : null}
            {product.weight ? <p className="mt-1 text-base text-black/50">כמות: {product.weight} גרם</p> : null}

            <div className="mt-4 flex items-baseline justify-start gap-2">
              {product.onSale && product.salePrice ? (
                <>
                  <span className="text-2xl font-bold text-brand-accent">
                    {formatPrice(product.salePrice, product.currency)}
                  </span>
                  <span className="text-lg text-black/40 line-through">
                    {formatPrice(product.regularPrice, product.currency)}
                  </span>
                </>
              ) : (
                <span className="text-2xl font-bold text-brand-accent">
                  {formatPrice(product.price, product.currency)}
                </span>
              )}
            </div>

            {product.weight && Number(product.weight) > 0 ? (
              <p className="mt-1 text-base text-black/40">
                מחיר ל-100 גרם:{" "}
                {formatPrice(
                  (Number(product.onSale && product.salePrice ? product.salePrice : product.price) /
                    Number(product.weight)) *
                    100,
                  product.currency
                )}
              </p>
            ) : null}

            <ProductPurchasePanel productId={product.databaseId} inStock={product.inStock} />

            {product.videoUrl ? (
              <video controls className="mt-6 w-full rounded-lg" src={product.videoUrl} />
            ) : null}

            <div className="mt-6 border-t border-black/5 pt-4">
              <SocialShare url={productUrl} title={product.name} />
            </div>
          </div>
        </div>

        <ProductTabs description={product.description} attributes={product.attributes} tabs={product.tabs} />
      </div>

      <FeatureStrip variant="compact" />

      {primaryCategory ? (
        <Suspense fallback={null}>
          <RelatedProducts categorySlug={primaryCategory.slug} excludeId={product.id} />
        </Suspense>
      ) : null}
    </div>
  );
}

/**
 * Streamed separately: it depends on the product's category, so awaiting it
 * inside the page made the whole page wait for two backend queries in a row.
 * Now the product itself paints first and this slider fills in below.
 */
async function RelatedProducts({ categorySlug, excludeId }: { categorySlug: string; excludeId: string }) {
  const { products } = await listProducts({ category: categorySlug, first: 13 });
  const related = products.filter((p) => p.id !== excludeId).slice(0, 12);
  if (related.length === 0) return null;

  return (
    <ProductSlider
      badge="מוצרים דומים"
      badgeIcon={<Sparkles className="h-3.5 w-3.5" />}
      title="אולי יעניין אותך גם"
      products={related}
      headerVariant="modern"
    />
  );
}
