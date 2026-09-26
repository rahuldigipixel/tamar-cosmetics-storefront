import type { Metadata } from "next";
import Image from "next/image";
import { getWholesalePage } from "@/lib/wpgraphql/tamarApi";
import { RichContent } from "@/components/ui/RichContent";
import { WholesaleImageSlider } from "@/components/wholesale/WholesaleImageSlider";
import { WholesaleLeadForm } from "@/components/wholesale/WholesaleLeadForm";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
 const page = await getWholesalePage();
 return { title: page?.heading || "מכירה סיטונאית" };
}

// Public path is the Hebrew "/מכירה-סיטונאית" (see the rewrite in
// next.config.ts) — a literal non-ASCII directory under src/app breaks
// static prerendering, same reason /brand-list exists for "/מותג/".
export default async function WholesalePage() {
 const page = await getWholesalePage();

 const heading = page?.heading || "מכירה סיטונאית";
 const contentHtml = page?.contentHtml || "";
 const ctaHeading = page?.ctaHeading || "";
 const heroImage = page?.heroImage ?? null;
 const ctaButtonLabel = page?.ctaButtonLabel || "שליחה";
 const sliderImages = page?.sliderImages ?? [];

 return (
 <div>
 <div className="border-b border-black/5 bg-gradient-to-br from-brand-soft/60 via-brand-soft/20 to-white">
 <div className="mx-auto max-w-[1600px] px-[15px] py-8 text-center sm:py-10">
 <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{heading}</h1>
 </div>
 </div>

 <div className="mx-auto max-w-[1600px] px-[15px] py-10 ">
 <RichContent html={contentHtml} className="mx-auto max-w-3xl text-center" />
 </div>

 {/* CTA: form + a single hero image — the form is first in document
 order and the image second, which (RTL page) already renders the
 form on the visual start side and the image on the end side,
 matching the reference site's form-left / image-right layout. */}
 <div className="bg-brand-soft/20 py-10 sm:py-14">
 <div className="mx-auto grid max-w-[1600px] items-center gap-10 px-[15px] lg:grid-cols-2 lg:gap-14">
 <div className="mx-auto flex w-full max-w-lg justify-center lg:justify-start">
 <WholesaleLeadForm heading={ctaHeading} buttonLabel={ctaButtonLabel} />
 </div>
 {heroImage ? (
 <div className="relative mx-auto aspect-[4/5] w-full max-w-lg overflow-hidden rounded-3xl shadow-lg">
 <Image
 src={heroImage.url}
 alt={heroImage.alt}
 fill
 sizes="(min-width: 1024px) 45vw, 100vw"
 className="object-cover"
 />
 </div>
 ) : null}
 </div>
 </div>

 {sliderImages.length > 0 ? (
 <div className="mx-auto max-w-[1600px] px-[15px] py-10 sm:py-14">
 <WholesaleImageSlider images={sliderImages} />
 </div>
 ) : null}
 </div>
 );
}
