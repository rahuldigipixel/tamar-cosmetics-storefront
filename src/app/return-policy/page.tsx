import type { Metadata } from "next";
import { getReturnPolicyPage } from "@/lib/wpgraphql/tamarApi";
import { PAGE_TOP, PAGE_BOTTOM } from "@/lib/pageSpacing";
import { RichContent } from "@/components/ui/RichContent";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getReturnPolicyPage();
  return { title: page?.heading || "מדיניות – החזר מוצר" };
}

// Public path is the Hebrew "/מדיניות-החזר-מוצר" (matching the live
// site) — see the rewrite in next.config.ts.
export default async function ReturnPolicyPage() {
  const page = await getReturnPolicyPage();
  const heading = page?.heading || "מדיניות – החזר מוצר";
  const contentHtml = page?.contentHtml ?? "";

  return (
    <div>
      {/* Measured from the legacy page: pink band #fde7eb, black 800-weight title (72px desktop / 35px mobile). The legacy Hebrew title falls back to the browser serif (Open Sans has no Hebrew glyphs there), so it is reproduced with a serif stack. */}
      <div className="bg-[#fde7eb]">
        <div className="mx-auto max-w-[1600px] px-[15px] py-[10px] text-center">
          <h1 className="font-[family-name:'Times_New_Roman',serif] text-[35px] font-extrabold leading-[35px] text-black lg:text-[72px] lg:leading-[72px]">{heading}</h1>
        </div>
      </div>

      {contentHtml ? (
        <div className={`mx-auto max-w-[1520px] px-[15px] min-[1550px]:px-0 ${PAGE_TOP} ${PAGE_BOTTOM}`}>
          <RichContent
            html={contentHtml}
            className="max-w-none !text-right [&_*]:!text-right !text-[18px] !leading-[1.6] !text-black lg:!text-[20px] lg:!leading-[32px] [&_h2]:!mb-5 [&_h2]:!mt-0 [&_h2]:!text-[23px] [&_h2]:!font-semibold [&_h2]:!leading-[30px] [&_h2]:!text-[#d52027] lg:[&_h2]:!text-[34px] [&_h3]:!mb-5 [&_h3]:!mt-0 [&_h3]:!text-[22px] [&_h3]:!leading-[30.8px] [&_h3]:!text-[#0c0c0c] [&_p]:!mb-5 [&_li]:!mb-[10px] [&_img]:!mx-auto [&_img]:!my-0 [&_img]:!rounded-none [&_img]:block [&_p:has(>img)]:!mb-0 [&_.elementor-widget-heading+div_p]:underline lg:[&_.elementor-widget-heading+div_p]:!mb-[25px] lg:[&_.elementor-widget-heading+div_p]:!text-[23px] lg:[&_.elementor-widget-heading+div_p]:!leading-[36.8px]"
          />
        </div>
      ) : null}
    </div>
  );
}
