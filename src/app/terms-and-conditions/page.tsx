import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { getTermsPage } from "@/lib/wpgraphql/tamarApi";
import { PAGE_TOP, PAGE_BOTTOM } from "@/lib/pageSpacing";
import { RichContent } from "@/components/ui/RichContent";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getTermsPage();
  return pageMetadata({ title: page?.heading || "תקנון אתר תמר קוסמטיקס", description: page?.contentHtml, route: "/terms-and-conditions" });
}

// Public path /terms-and-conditions (same as the live site and the footer link).
export default async function TermsPage() {
  const page = await getTermsPage();
  const heading = page?.heading || "תקנון אתר תמר קוסמטיקס";
  const contentHtml = page?.contentHtml ?? "";

  return (
    <div>
      {/* Measured from the legacy page: pink band #fde7eb, black 800-weight title (72px desktop / 35px mobile). The legacy Hebrew title falls back to the browser serif (Open Sans has no Hebrew glyphs there), so it is reproduced with a serif stack. */}
      <div className="bg-[#fde7eb]">
        <div className="mx-auto max-w-[1600px] px-[15px] py-[10px] text-center">
          <h1 className="font-[family-name:'Times_New_Roman',serif] text-[35px] font-extrabold leading-[35px] text-black lg:text-[72px] lg:leading-[72px]">{heading}</h1>
        </div>
      </div>

      {/* Measured from the legacy page (user-approved sizes below the 18px floor on desktop): body 12px/19.2px (18px/28.8px mobile), h3 22px/30.8px bold #0c0c0c, strong 600, 20px paragraph spacing, text column 1282px on the right of a 1570px container. */}
      {contentHtml ? (
        <div className={`mx-auto max-w-[1570px] px-[25px] lg:px-[14px] ${PAGE_TOP} ${PAGE_BOTTOM}`}>
          <RichContent
            html={contentHtml}
            className="max-w-[1282px] !text-right [&_*]:!text-right !text-[18px] !leading-[28.8px] !text-black lg:!text-[12px] lg:!leading-[19.2px] [&_h3]:!mb-5 [&_h3]:!mt-0 [&_h3]:!text-[22px] [&_h3]:!font-bold [&_h3]:!leading-[30.8px] [&_h3]:!text-[#0c0c0c] [&_p]:!mb-5 [&_p:last-child]:!mb-0 [&_strong]:!font-semibold [&_strong]:!text-black"
          />
        </div>
      ) : null}
    </div>
  );
}
