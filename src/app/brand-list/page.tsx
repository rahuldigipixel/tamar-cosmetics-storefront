import { listBrands } from "@/lib/wpgraphql/brands";
import { getSiteSettings } from "@/lib/wpgraphql/tamarApi";
import { BrandGrid } from "./BrandGrid";

export const revalidate = 300;

export default async function BrandListPage() {
  const [brands, siteSettings] = await Promise.all([listBrands(), getSiteSettings()]);

  const selectedSlugs = siteSettings?.selectedBrandSlugs ?? [];
  const visibleBrands =
    selectedSlugs.length > 0 ? brands.filter((b) => selectedSlugs.includes(b.slug)) : brands;

  const title = siteSettings?.brandPageTitle || "מותגים";
  const description = siteSettings?.brandPageDescription || "";

  return (
    <div>
      {/* Pink title band — same as category page */}
      <div className="bg-[#fde7eb] px-[15px] py-[15px] text-center">
        <h1 className="text-[28px] font-bold leading-[1.2] text-[#242424] md:text-[40px]">{title}</h1>
      </div>

      {description ? (
        <div className="mx-auto max-w-[1600px] px-[15px] pt-[40px]">
          <div
            className="text-center text-[18px] leading-[1.6] text-[#0c0c0c] md:text-[21px] md:leading-[33.6px] [&_h1]:text-[26px] [&_h1]:font-bold [&_h2]:text-[24px] [&_h2]:font-bold [&_h3]:text-[22px] [&_h3]:font-semibold [&_p]:mb-[20px] [&_strong]:font-bold"
            dangerouslySetInnerHTML={{ __html: description }}
          />
        </div>
      ) : null}

      <div className="mx-auto max-w-[1600px] px-[15px] py-8 pb-12">
        <BrandGrid brands={visibleBrands} />
      </div>
    </div>
  );
}
