import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { PAGE_BOTTOM } from "@/lib/pageSpacing";
import { getSuppliersPage } from "@/lib/wpgraphql/tamarApi";
import { PageLeadForm } from "@/components/ui/PageLeadForm";
import { ContactInfoRows } from "@/components/ui/ContactInfoRows";

export const revalidate = 300;

const FALLBACK_TITLE = "שותפות עסקית ורכש - תמר קוסמטיקס";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getSuppliersPage();
  return pageMetadata({ title: page?.heading || FALLBACK_TITLE, description: page?.description, route: "/suppliers" });
}

// Public path is the Hebrew "/ספקים" (matching the live site) — see the rewrite
// in next.config.ts. Layout measured from the legacy page (1920 / 390): pink band
// + 72px/35px title, 48px/38px two-tone sub-title, 21px description, red 20px/18px
// semibold call-to-action, 543px/300px form, centered contact rows (16px/15px).
export default async function SuppliersPage() {
  const page = await getSuppliersPage();
  const sub = (page?.subheading ?? "").trim();
  const [firstWord, ...rest] = sub.split(" ");
  const highlightLines = (page?.highlight ?? "").split("\n").filter((l) => l.trim());

  return (
    <div className={`font-[family-name:Arial,Helvetica,sans-serif] ${PAGE_BOTTOM}`}>
      <div className="bg-[#fde7eb]">
        <div className="mx-auto max-w-[1600px] px-[10px] py-5 text-center sm:px-[15px]">
          <h1 className="font-[family-name:'Times_New_Roman',serif] text-[35px] font-extrabold leading-[35px] text-black lg:text-[72px] lg:leading-[72px]">
            {page?.heading || FALLBACK_TITLE}
          </h1>
        </div>
      </div>

      <div className="px-[25px] text-center sm:px-[15px]">
        {sub ? (
          <h2 className="mt-0 text-[38px] font-light leading-[38px] text-black lg:text-[48px] lg:mt-[10px] lg:leading-[48px]">
            <span className="font-extrabold text-[#d52027]">{firstWord}</span>
            {rest.length ? ` ${rest.join(" ")}` : ""}
          </h2>
        ) : null}

        {page?.description ? (
          <p className="mx-auto mt-5 max-w-[1550px] whitespace-pre-line text-[16px] leading-[30px] text-black lg:text-[23px]">{page.description}</p>
        ) : null}

        {highlightLines.length > 0 ? (
          <div className="mx-auto mt-5 max-w-[1550px] text-[18px] font-semibold leading-[18px] text-[#d52027] lg:text-[20px] lg:leading-[32px]">
            {highlightLines.map((line, i) => (
              <p key={i} className="mb-5 last:mb-0">
                {line}
              </p>
            ))}
          </div>
        ) : null}
      </div>

      <div className="mx-auto mt-10 flex w-[300px] lg:mt-5 max-w-full flex-col items-center lg:w-[543px]">
        <PageLeadForm
          form="suppliers"
          heading={page?.form.heading ?? ""}
          nameLabel={page?.form.nameLabel}
          checkboxLabel={page?.form.checkboxLabel ?? ""}
          buttonLabel={page?.form.buttonLabel ?? ""}
          widthClassName="max-w-none"
          wideButton
        />
      </div>

      <div className="mx-auto mt-[55px] w-[264px] lg:w-[282px]">
        <ContactInfoRows items={page?.items ?? []} className="text-right text-[15px] leading-[19.5px] lg:text-[16px] lg:leading-[20.8px]" />
      </div>
    </div>
  );
}
