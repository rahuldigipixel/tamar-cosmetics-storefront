import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import Image from "next/image";
import { getWholesalePage } from "@/lib/wpgraphql/tamarApi";
import { RichContent } from "@/components/ui/RichContent";
import { TitleBand } from "@/components/ui/ContentPageView";
import { WholesaleImageSlider } from "@/components/wholesale/WholesaleImageSlider";
import { WholesaleLeadForm } from "@/components/wholesale/WholesaleLeadForm";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
 const page = await getWholesalePage();
 return pageMetadata({ title: page?.heading, description: page?.contentHtml, route: "/wholesale" });
}

// Public path is the Hebrew "/מכירה-סיטונאית-תמר-קוסמטיקס" (see the rewrite in
// next.config.ts) — a literal non-ASCII directory under src/app breaks
// static prerendering, same reason /brand-list exists for "/מותג/".
export default async function WholesalePage() {
 const page = await getWholesalePage();

 // Every field below is rendered exactly as saved in wp-admin — no
 // fallback/placeholder copy injected on this side.
 const heading = page?.heading ?? "";
 const contentHtml = page?.contentHtml ?? "";
 const ctaHeading = page?.ctaHeading ?? "";
 const heroImage = page?.heroImage ?? null;
 const ctaCheckboxLabel = page?.ctaCheckboxLabel ?? "";
 const ctaButtonLabel = page?.ctaButtonLabel ?? "";
 const sliderImages = page?.sliderImages ?? [];

 return (
 <div>
 <TitleBand heading={heading} />

 <div className="mx-auto max-w-[1600px] px-[15px] py-10">
 <RichContent html={contentHtml} className="max-w-none" />
 </div>

 {/* CTA: full-bleed two-color split — solid brand-accent panel holding
 the form on the left (34% width), soft-pink panel holding the hero
 image on the right (66% width) — edge to edge, no page gutter,
 matching the reference site's layout exactly. The reference keeps the
 form physically on the left even though the page is RTL, so this
 wrapper is forced dir="ltr" (grid auto-flow starts left-to-right)
 while each panel is dir="rtl" again internally so the Hebrew content
 inside still reads correctly. */}
 <div dir="ltr" className="grid w-full lg:grid-cols-[45%_55%]">
 <div dir="rtl" className="flex items-center justify-center bg-brand-accent px-6 py-14 sm:px-10 sm:py-16 lg:px-12 lg:py-20 xl:px-16">
 <WholesaleLeadForm heading={ctaHeading} checkboxLabel={ctaCheckboxLabel} buttonLabel={ctaButtonLabel} />
 </div>
 {heroImage ? (
 <div className="relative min-h-[320px] bg-gradient-to-br from-brand-soft/50 to-brand-soft/10 sm:min-h-[420px] lg:min-h-0">
 <Image
 src={heroImage.url}
 alt={heroImage.alt}
 fill
 sizes="(min-width: 1024px) 66vw, 100vw"
 className="object-cover"
 />
 </div>
 ) : null}
 </div>

 {sliderImages.length > 0 ? (
 <div className="mx-auto max-w-[1600px] px-[15px] py-10 sm:py-14">
 <WholesaleImageSlider images={sliderImages} />
 </div>
 ) : null}
 </div>
 );
}
