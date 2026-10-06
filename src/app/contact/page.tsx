import type { Metadata } from "next";
import { PAGE_BOTTOM } from "@/lib/pageSpacing";
import { getContactPage } from "@/lib/wpgraphql/tamarApi";
import { PageLeadForm } from "@/components/ui/PageLeadForm";
import { ContactInfoRows } from "@/components/ui/ContactInfoRows";

export const revalidate = 300;

const FALLBACK_TITLE = "שירות לקוחות - תמר קוסמטיקס";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getContactPage();
  return { title: page?.heading || FALLBACK_TITLE };
}

// Sizes measured from the legacy /contact page: pink band + 72px/35px 800
// title, 21px centered description, 420px form column (right), 16px/20.8px
// side column (left). Form comes first in the DOM, so on mobile it sits above
// the side rows and in RTL desktop it is the right-hand column.
export default async function ContactPage() {
  const page = await getContactPage();
  const items = page?.items ?? [];

  return (
    <div className={`font-[family-name:Arial,Helvetica,sans-serif] ${PAGE_BOTTOM}`}>
      <div className="bg-[#fde7eb]">
        <div className="mx-auto max-w-[1600px] px-[10px] py-5 text-center sm:px-[15px]">
          <h1 className="font-[family-name:'Times_New_Roman',serif] text-[35px] font-extrabold leading-[35px] text-black lg:text-[72px] lg:leading-[72px]">
            {page?.heading || FALLBACK_TITLE}
          </h1>
        </div>
      </div>

      {page?.description ? (
        <p className="mx-auto mt-0 max-w-[1550px] whitespace-pre-line px-[25px] lg:mt-[10px] sm:px-[15px] text-center text-[21px] leading-[33.6px] text-[#0c0c0c]">
          {page.description}
        </p>
      ) : null}

      <div className="mx-auto mt-[75px] grid max-w-[1180px] gap-y-10 lg:mt-[55px] px-[20px] lg:grid-cols-[420px_1fr] lg:gap-x-[clamp(40px,21.6vw,415px)]">
        <PageLeadForm
          form="contact"
          accentFirstWord
          heading={page?.form.heading ?? ""}
          checkboxLabel={page?.form.checkboxLabel ?? ""}
          buttonLabel={page?.form.buttonLabel ?? ""}
        />

        {/* wp-admin rows (see ContactInfoRows). */}
        <ContactInfoRows items={items} className="text-right text-[15px] leading-[19.5px] lg:pt-[38px] lg:text-[16px] lg:leading-[20.8px]" />
      </div>
    </div>
  );
}
