import Image from "next/image";
import Link from "next/link";
import { listBrands } from "@/lib/wpgraphql/brands";
import { getSiteSettings } from "@/lib/wpgraphql/tamarApi";

export const revalidate = 300;

export default async function BrandListPage() {
  const [brands, siteSettings] = await Promise.all([listBrands(), getSiteSettings()]);

  // Shows exactly what's picked in wp-admin → הגדרות תמר, regardless of
  // whether a product happens to be assigned to that brand yet — empty
  // selection falls back to every pa_brand term.
  const selectedSlugs = siteSettings?.selectedBrandSlugs ?? [];
  const visibleBrands = selectedSlugs.length > 0 ? brands.filter((b) => selectedSlugs.includes(b.slug)) : brands;

  const title = siteSettings?.brandPageTitle || "מותגים";
  const description = siteSettings?.brandPageDescription || "";

  return (
    <div>
      <div className="border-b border-black/5 bg-gradient-to-br from-brand-soft/60 via-brand-soft/20 to-white">
        <div className="mx-auto max-w-[1400px] px-4 py-5 text-center sm:px-6 sm:py-6">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>

          {description ? (
            <div
              className="prose prose-sm mx-auto mt-2 max-w-3xl text-lg leading-relaxed text-black/70 [&_p]:mb-1.5"
              dangerouslySetInnerHTML={{ __html: description }}
            />
          ) : null}
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-4 py-8 pb-12 sm:px-6">
        {visibleBrands.length === 0 ? (
          <p className="text-black/60">לא נמצאו מותגים.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {visibleBrands.map((brand) => (
              <Link
                key={brand.id}
                href={`/brand/${brand.slug}/`}
                className="group flex flex-col overflow-hidden rounded-xl border border-black/5 bg-white shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="relative aspect-square w-full bg-brand-soft/40">
                  <Image
                    src={brand.thumbnailUrl || "/brand/logo.png"}
                    alt={brand.name}
                    fill
                    sizes="(min-width: 1024px) 16vw, (min-width: 640px) 22vw, 40vw"
                    className="object-contain p-3 transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <span className="border-t border-black/5 px-2 py-2 text-center text-base font-semibold leading-snug text-black/85 group-hover:text-brand-accent">
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
