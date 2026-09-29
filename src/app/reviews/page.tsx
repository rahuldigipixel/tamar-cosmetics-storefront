import type { Metadata } from "next";
import { getReviewsPage } from "@/lib/wpgraphql/tamarApi";
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
 const page = await getReviewsPage();

 const heading = page?.heading || "ביקורות לקוחות";
 const descriptionHtml = page?.descriptionHtml || "";

 return (
 <div>
 <div className="border-b border-black/5 bg-gradient-to-br from-brand-soft/60 via-brand-soft/20 to-white">
 <div className="mx-auto max-w-[1600px] px-[15px] py-6 text-center sm:py-6">
 <h1 className="text-3xl font-extrabold tracking-tight text-brand-accent sm:text-5xl lg:text-[50px] lg:leading-[50px]">{heading}</h1>
 </div>
 </div>

 {descriptionHtml ? (
 <div className="mx-auto max-w-[1600px] px-[15px] py-10">
 <RichContent
 html={descriptionHtml}
 className="mx-auto max-w-none text-center !text-black !text-[21px] !leading-[34px]"
 />
 </div>
 ) : null}

 <section className="w-full bg-white py-4 sm:py-[0px]">
 <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
 <FlashyReviewsWidget />
 </div>
 </section>
 </div>
 );
}
