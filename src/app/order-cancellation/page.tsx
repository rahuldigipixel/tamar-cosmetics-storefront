import type { Metadata } from "next";
import { getOrderCancellationPage } from "@/lib/wpgraphql/tamarApi";
import { PAGE_TOP, PAGE_BOTTOM } from "@/lib/pageSpacing";
import { RichContent } from "@/components/ui/RichContent";
import { PageLeadForm } from "@/components/ui/PageLeadForm";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getOrderCancellationPage();
  return { title: page?.heading || "ביטול עסקה" };
}

// Public path is the Hebrew "/מדיניות-ביטול-הזמנה-תמר-קוסמטיקס" (matching the live
// site) — see the rewrite in next.config.ts.
export default async function OrderCancellationPage() {
  const page = await getOrderCancellationPage();
  const heading = page?.heading || "ביטול עסקה";
  const contentHtml = page?.contentHtml ?? "";

  return (
    <div className="font-[family-name:Arial,Helvetica,sans-serif]">
      {/* Measured from the legacy page: pink band #fde7eb, black 800-weight title (72px desktop / 35px mobile). The legacy Hebrew title falls back to the browser serif (Open Sans has no Hebrew glyphs there), so it is reproduced with a serif stack. */}
      <div className="bg-[#fde7eb]">
        <div className="mx-auto max-w-[1600px] px-[15px] py-[10px] text-center">
          <h1 className="font-[family-name:'Times_New_Roman',serif] text-[35px] font-extrabold leading-[35px] text-black lg:text-[72px] lg:leading-[72px]">{heading}</h1>
        </div>
      </div>

      {/* Measured from the legacy page: text column 1219px on the right, 19px/30px (18px/30px mobile), 20px paragraph spacing, form heading 48px/38px light. */}
      <div className={`mx-auto max-w-[1570px] px-[25px] lg:px-[10px] ${PAGE_TOP} ${PAGE_BOTTOM}`}>
        <div className="max-w-[1219px]">
          {contentHtml ? (
            <RichContent
              html={contentHtml}
              className="max-w-none !text-right !text-[18px] !leading-[30px] !text-black lg:!text-[19px] [&_p]:!mb-5 [&_p:last-child]:!mb-0 [&_li]:!mb-[10px] [&_strong]:!font-semibold [&_b]:!font-bold"
            />
          ) : null}

          <div className={contentHtml ? "pt-10" : ""}>
            <PageLeadForm
              form="order-cancellation"
              wideHeading
              heading={page?.form.heading ?? ""}
              checkboxLabel={page?.form.checkboxLabel ?? ""}
              buttonLabel={page?.form.buttonLabel ?? ""}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
