import type { Metadata } from "next";
import { getGlobalData, getReviewsPage } from "@/lib/wpgraphql/tamarApi";
import { resolveIntegrations } from "@/lib/integrations";
import { RichContent } from "@/components/ui/RichContent";
import { FlashyReviewsWidget } from "@/components/reviews/FlashyReviewsWidget";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
 const page = await getReviewsPage();
 return { title: page?.heading || "ביקורות לקוחות" };
}

// Public path is the Hebrew "/ביקורות-לקוחות-תמר-קוסמטיקס" (matching the
// live site's own URL) — see the rewrite in next.config.ts, same reason
// /brand-list exists for "/מותג/".
export default async function ReviewsPage() {
 const [page, global] = await Promise.all([getReviewsPage(), getGlobalData()]);
 const integrations = resolveIntegrations(global?.settings);

 const heading = page?.heading || "ביקורות לקוחות";
 const descriptionHtml = page?.descriptionHtml || "";

 return (
 <div>
 <div className="bg-[#fde7eb]">
 <div className="mx-auto max-w-[1600px] px-[15px] py-[10px] text-center lg:py-5">
 <h1 className="text-[43px] font-bold leading-[43px] text-brand-accent lg:text-[50px] lg:leading-[50px]">{heading}</h1>
 </div>
 </div>

 {descriptionHtml ? (
 <div className="mx-auto max-w-[1600px] px-[15px] py-[10px]">
 <RichContent
 html={descriptionHtml}
 className="mx-auto max-w-none text-center [&_p]:!my-0 !text-black !text-[21px] !leading-[34px]"
 />
 </div>
 ) : null}

 <section className="w-full bg-white py-4 sm:py-[0px]">
 <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
 <FlashyReviewsWidget elementId={integrations.flashyReviewsElementId} legacyOrigin={integrations.flashyLegacySiteOrigin} />
 </div>
 </section>
 </div>
 );
}
