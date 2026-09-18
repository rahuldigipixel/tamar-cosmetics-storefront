import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { listProducts } from "@/lib/wpgraphql/products";
import { getBrandBySlug } from "@/lib/wpgraphql/brands";
import { CategoryProductGrid } from "@/components/product/CategoryProductGrid";

export const revalidate = 60;

interface BrandPageProps {
  params: Promise<{ slug: string }>;
}

export default async function BrandPage({ params }: BrandPageProps) {
  const { slug } = await params;
  const activeSlug = decodeURIComponent(slug).normalize("NFC");

  const [brand, { products, hasNextPage, endCursor }] = await Promise.all([
    getBrandBySlug(activeSlug),
    listProducts({ brand: activeSlug, first: 20 }),
  ]);

  if (!brand) notFound();

  return (
    <div>
      <div className="border-b border-black/5 bg-gradient-to-br from-brand-soft/60 via-brand-soft/20 to-white">
        <div className="mx-auto max-w-[1400px] px-4 py-4 sm:px-6">
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{brand.name}</h1>

          <nav className="mt-1.5 flex flex-wrap items-center gap-1.5 text-base text-black/50">
            <Link href="/" className="hover:text-brand-accent">
              בית
            </Link>
            <span>/</span>
            <Link href="/מותג/" className="hover:text-brand-accent">
              מותגים
            </Link>
            <span>/</span>
            <span className="text-black/80">{brand.name}</span>
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-4 py-8 pb-12 sm:px-6">
        <CategoryProductGrid
          brandSlug={activeSlug}
          initialProducts={products}
          initialHasNextPage={hasNextPage}
          initialEndCursor={endCursor}
        />
      </div>

      {brand.desktopBannerUrl || brand.mobileBannerUrl ? (
        <div className="border-t border-black/5">
          <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6">
            {brand.desktopBannerUrl ? (
              <Image
                src={brand.desktopBannerUrl}
                alt={brand.name}
                width={1400}
                height={420}
                className="hidden w-full rounded-2xl object-cover sm:block"
              />
            ) : null}
            {brand.mobileBannerUrl ? (
              <Image
                src={brand.mobileBannerUrl}
                alt={brand.name}
                width={700}
                height={700}
                className="w-full rounded-2xl object-cover sm:hidden"
              />
            ) : null}
          </div>
        </div>
      ) : null}

      {brand.extraDescription ? (
        <div className="border-t border-black/5">
          <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6">
            <div
              className="prose prose-sm mx-auto max-w-3xl text-base leading-relaxed text-black/70 [&_p]:mb-2"
              dangerouslySetInnerHTML={{ __html: brand.extraDescription }}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
