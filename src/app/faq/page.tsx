import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { PAGE_BOTTOM } from "@/lib/pageSpacing";
import Image from "next/image";
import { getFaqPage } from "@/lib/wpgraphql/tamarApi";
import { RichContent } from "@/components/ui/RichContent";
import { FaqSearch } from "@/components/ui/FaqSearch";

export const revalidate = 300;

const FALLBACK_TITLE = "שאלות ותשובות - תמר קוסמטיקס";
const CONTENT_ID = "faq-content";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getFaqPage();
  return pageMetadata({ title: page?.heading || FALLBACK_TITLE, description: page?.contentHtml, route: "/faq" });
}

// Public path is the Hebrew "/שאלות-נפוצות-אתר-תמר-קוסמטיקס" (matching the
// live site) — see the rewrite in next.config.ts.
export default async function FaqPage() {
  const page = await getFaqPage();
  const heading = page?.heading || FALLBACK_TITLE;
  const banner = page?.banner ?? null;
  const bottomImage = page?.bottomImage ?? null;
  const contentHtml = page?.contentHtml ?? "";

  return (
    <div className={PAGE_BOTTOM}>
      <h1 className="px-[25px] py-5 text-center font-[family-name:'Times_New_Roman',serif] text-[20px] font-bold leading-[30px] text-[#d52027] lg:px-[15px] lg:text-[30px]">
        {heading}
      </h1>

      {banner ? (
        <div className="mx-auto max-w-[1550px] px-[15px] min-[1580px]:px-0">
          <Image
            src={banner.url}
            alt={banner.alt}
            width={banner.width}
            height={banner.height}
            sizes="(min-width: 1580px) 1550px, 100vw"
            priority
            className="h-auto w-full"
          />
        </div>
      ) : null}

      <FaqSearch contentId={CONTENT_ID} />

      {contentHtml ? (
        <div className="mx-auto max-w-[1570px] px-[15px]">
          <div id={CONTENT_ID} className="bg-white px-[17px] py-6 shadow-[0_0_10px_rgba(0,0,0,0.15)] lg:px-[35px]">
            <RichContent
              html={contentHtml}
              className="max-w-none !text-right font-[family-name:Arial,Helvetica,sans-serif] !text-[18px] !leading-[23.4px] !text-black lg:!leading-[28.8px] [&_h2]:!mb-5 [&_h2]:!mt-0 [&_h2]:!text-[24px] [&_h2]:!font-bold [&_h2]:!leading-[33.6px] [&_h2]:!text-[#0c0c0c] [&_h3]:!mb-5 [&_h3]:!mt-0 [&_h3]:!text-[22px] [&_h3]:!font-bold [&_h3]:!leading-[30.8px] [&_h3]:!text-[#0c0c0c] [&_p]:!mb-5 [&_ol]:!mb-5 [&_ul]:!mb-5 [&_li]:!mb-0 [&_strong]:!font-semibold [&_b]:!font-semibold"
            />
          </div>
        </div>
      ) : null}

      {/* Second admin image, same width as the top banner, under the text box. */}
      {bottomImage ? (
        <div className="mx-auto mt-[13px] max-w-[1550px] px-[15px] min-[1580px]:px-0">
          <Image
            src={bottomImage.url}
            alt={bottomImage.alt}
            width={bottomImage.width}
            height={bottomImage.height}
            sizes="(min-width: 1580px) 1550px, 100vw"
            className="h-auto w-full"
          />
        </div>
      ) : null}
    </div>
  );
}
