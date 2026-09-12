import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { getProductBySlug, listProducts } from "@/lib/wpgraphql/products";
import { wpEnv } from "@/lib/wpgraphql/env";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductTabs } from "@/components/product/ProductTabs";
import { ProductPurchasePanel } from "@/components/product/ProductPurchasePanel";
import { SocialShare } from "@/components/product/SocialShare";
import { FeatureStrip } from "@/components/home/FeatureStrip";
import { ProductSlider } from "@/components/home/ProductSlider";

export const revalidate = 60;

function formatPrice(value: string, currency: string) {
  const numeric = Number(value);
  return new Intl.NumberFormat("he-IL", { style: "currency", currency }).format(
    Number.isNaN(numeric) ? 0 : numeric
  );
}

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
  const { products: relatedRaw } = primaryCategory
    ? await listProducts({ category: primaryCategory.slug, first: 13 })
    : { products: [] };
  const relatedProducts = relatedRaw.filter((p) => p.id !== product.id).slice(0, 12);

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
        <nav className="mb-6 flex flex-wrap items-center gap-1.5 text-base text-black/50">
          <Link href="/" className="hover:text-brand-accent">
            בית
          </Link>
          {primaryCategory ? (
            <span className="flex items-center gap-1.5">
              <span>/</span>
              <Link href={`/product-category/${primaryCategory.slug}/`} className="hover:text-brand-accent">
                {primaryCategory.name}
              </Link>
            </span>
          ) : null}
          <span>/</span>
          <span className="text-black/80">{product.name}</span>
        </nav>

        <div className="grid gap-10 md:grid-cols-2">
          <ProductGallery images={product.images} name={product.name} productId={product.databaseId} />

          <div className="text-right">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{product.name}</h1>

            {product.shortDescription ? (
              <div
                className="prose prose-sm mt-3 max-w-none text-right text-black/70"
                dangerouslySetInnerHTML={{ __html: product.shortDescription }}
              />
            ) : null}

            {product.sku ? <p className="mt-3 text-base text-black/50">מק&quot;ט: {product.sku}</p> : null}

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

      {relatedProducts.length > 0 ? (
        <ProductSlider
          badge="מוצרים דומים"
          badgeIcon={<Sparkles className="h-3.5 w-3.5" />}
          title="אולי יעניין אותך גם"
          products={relatedProducts}
          headerVariant="modern"
        />
      ) : null}
    </div>
  );
}
