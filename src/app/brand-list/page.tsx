import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { listBrands } from "@/lib/wpgraphql/brands";
import { getGlobalData } from "@/lib/wpgraphql/tamarApi";
import { BrandGrid } from "./BrandGrid";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const settings = (await getGlobalData())?.settings;
  return pageMetadata({ title: settings?.brandPageTitle || "מותגים", description: settings?.brandPageDescription, route: "/brand-list" });
}

export default async function BrandListPage() {
  // getGlobalData() is React `cache()`-wrapped and already called once by
  // the root layout for the header — this reuses that same request instead
  // of firing a second /global-data call just for settings.
  const [brands, global] = await Promise.all([listBrands(), getGlobalData()]);
  const siteSettings = global?.settings ?? null;

  // wp-admin → הגדרות מותגים: the picked brands, in the order the admin dragged them into. Nothing picked = every brand.
  const selectedIds = siteSettings?.selectedBrandIds ?? [];
  const brandById = new Map(brands.map((b) => [b.databaseId, b]));
  const visibleBrands =
    selectedIds.length > 0
      ? selectedIds.flatMap((id) => {
          const brand = brandById.get(id);
          return brand ? [brand] : [];
        })
      : brands;

  const title = siteSettings?.brandPageTitle || "מותגים";
  const description = siteSettings?.brandPageDescription || "";

  return (
    <div>
      {/* Pink title band — brand-page-specific: legacy renders this h1 in the
          browser's serif fallback (Open Sans never loads), 72px/800, 72px line
          height, ~20px band padding. Measured from the legacy /מותג/ page. */}
      <div className="bg-[#fde7eb] px-[15px] py-[20px] text-center">
        <h1 className="font-[serif] text-[44px] font-extrabold leading-[1.1] text-black md:text-[72px] md:leading-[72px]">
          {title}
        </h1>
      </div>

      {/* Description: Arial 400, 21px/34px, rgb(12,12,12), ~900px wide column
          (same width as the search box), 50px below the title band. */}
      {description ? (
        <div className="mx-auto max-w-[1600px] px-[15px] pt-[50px]">
          <div
            className="mx-auto max-w-[900px] text-center font-[Arial,Helvetica,sans-serif] text-[18px] font-normal leading-[30px] text-[#0c0c0c] md:text-[21px] md:leading-[34px] [&_h1]:text-[length:inherit] [&_h1]:font-normal [&_h1]:leading-[inherit] [&_h2]:text-[length:inherit] [&_h2]:font-normal [&_h2]:leading-[inherit] [&_h3]:text-[length:inherit] [&_h3]:font-normal [&_h3]:leading-[inherit] [&_p]:mb-[20px] [&_p:last-child]:mb-0 [&_strong]:font-bold"
            dangerouslySetInnerHTML={{ __html: description }}
          />
        </div>
      ) : null}

      {/* 1570px of grid between the 15px side gutters (legacy: 6 × 261.7px cells at 1920px). */}
      <div className="mx-auto max-w-[1600px] px-[15px] pb-[10px] pt-[20px] md:pb-[0px]">
        <BrandGrid brands={visibleBrands} />
      </div>
    </div>
  );
}
