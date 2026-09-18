import Image from "next/image";
import Link from "next/link";
import { listBrands, filterSlugsWithProducts } from "@/lib/wpgraphql/brands";
import { getSiteSettings } from "@/lib/wpgraphql/tamarApi";

export const revalidate = 300;

export default async function BrandListPage() {
  const [brands, siteSettings] = await Promise.all([listBrands(), getSiteSettings()]);

  const selectedSlugs = siteSettings?.selectedBrandSlugs ?? [];
  const candidateBrands = selectedSlugs.length > 0 ? brands.filter((b) => selectedSlugs.includes(b.slug)) : brands;

  // The taxonomy's own "count" is stale for most brands here, so a brand
  // picked in wp-admin only actually shows once it's confirmed to have a
  // real published product assigned.
  const slugsWithProducts = await filterSlugsWithProducts(candidateBrands.map((b) => b.slug));
  const visibleBrands = candidateBrands.filter((b) => slugsWithProducts.has(b.slug));

  return (
    <div>
      <div className="border-b border-black/5 bg-gradient-to-br from-brand-soft/60 via-brand-soft/20 to-white">
        <div className="mx-auto max-w-[1400px] px-4 py-4 sm:px-6">
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">מותגים</h1>

          <nav className="mt-1.5 flex flex-wrap items-center gap-1.5 text-base text-black/50">
            <Link href="/" className="hover:text-brand-accent">
              בית
            </Link>
            <span>/</span>
            <span className="text-black/80">מותגים</span>
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-4 py-8 pb-12 sm:px-6">
        {visibleBrands.length === 0 ? (
          <p className="text-black/60">לא נמצאו מותגים.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {visibleBrands.map((brand) => (
              <Link
                key={brand.id}
                href={`/brand/${brand.slug}/`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm transition-shadow hover:shadow-lg"
              >
                <div className="relative aspect-square w-full bg-brand-soft/40">
                  <Image
                    src={brand.thumbnailUrl || "/brand/logo.png"}
                    alt={brand.name}
                    fill
                    sizes="(min-width: 1024px) 20vw, (min-width: 640px) 25vw, 33vw"
                    className="object-contain p-6 transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <span className="border-t border-black/5 px-3 py-3 text-center text-base font-medium text-black/80 group-hover:text-brand-accent">
                  {brand.name}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
