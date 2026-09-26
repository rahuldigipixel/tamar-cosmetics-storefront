import type { Metadata } from "next";
import { getReviewsPage } from "@/lib/wpgraphql/tamarApi";
import { RichContent } from "@/components/ui/RichContent";
import { CustomerReviews } from "@/components/home/CustomerReviews";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
 const page = await getReviewsPage();
 return { title: page?.heading || "ביקורות לקוחות" };
}

// Public path is the Hebrew "/ביקורות-לקוחות" (see the rewrite in
// next.config.ts) — same reason /brand-list exists for "/מותג/".
export default async function ReviewsPage() {
 const page = await getReviewsPage();

 const heading = page?.heading || "ביקורות לקוחות";
 const descriptionHtml = page?.descriptionHtml || "";

 return (
 <div>
 <div className="border-b border-black/5 bg-gradient-to-br from-brand-soft/60 via-brand-soft/20 to-white">
 <div className="mx-auto max-w-[1600px] px-[15px] py-8 text-center sm:py-10">
 <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{heading}</h1>
 {descriptionHtml ? (
 <RichContent html={descriptionHtml} className="mx-auto mt-3 max-w-3xl text-base text-black/70" />
 ) : null}
 </div>
 </div>

 <CustomerReviews showHeading={false} />
 </div>
 );
}
