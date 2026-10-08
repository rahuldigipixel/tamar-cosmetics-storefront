import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import Image from "next/image";
import { getAppPage, type AppPageImage } from "@/lib/wpgraphql/tamarApi";
import { PAGE_BOTTOM } from "@/lib/pageSpacing";
import { AppVideo } from "@/components/app/AppVideo";

export const revalidate = 300;

const FALLBACK_TITLE = "אפליקציית תמר קוסמטיקס";
const RED = "bg-[#d52027]";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getAppPage();
  return pageMetadata({ title: page?.heroTitle?.replace(/\s*\n\s*/g, " ") || FALLBACK_TITLE, description: page?.heroText, route: "/app" });
}

/** YouTube watch / short / embed URL → video id. */
function youtubeId(url: string): string | null {
  const m = url.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/);
  return m ? m[1] : null;
}

function StoreBadges({ page, className = "" }: { page: Awaited<ReturnType<typeof getAppPage>>; className?: string }) {
  const badges = [
    { href: page?.appStoreUrl, img: page?.appStoreImage, alt: "Download on the App Store" },
    { href: page?.googlePlayUrl, img: page?.googlePlayImage, alt: "Get it on Google Play" },
  ];
  return (
    <div className={`flex items-center gap-4 ${className}`} dir="ltr">
      {badges.map((b) =>
        b.img ? (
          <a key={b.alt} href={b.href || "#"} target="_blank" rel="noopener noreferrer" className="block transition hover:-translate-y-0.5">
            <Image src={b.img.url} alt={b.alt} width={b.img.width || 180} height={b.img.height || 50} sizes="180px" className="h-[50px] w-auto" />
          </a>
        ) : null,
      )}
    </div>
  );
}

function Img({ image, alt = "", sizes, className }: { image: AppPageImage; alt?: string; sizes: string; className?: string }) {
  return <Image src={image.url} alt={alt} width={image.width || 800} height={image.height || 800} sizes={sizes} className={className} />;
}

// Public path is the Hebrew "/אפליקציית-תמר-קומסיטקס" (matching the live site) — see the
// rewrite in next.config.ts. Sections are managed in wp-admin → הגדרות תמר → אפליקציית תמר.
export default async function AppPage() {
  const page = await getAppPage();
  // `features` guards a stale cached response in the pre-redesign shape (heading/contentHtml).
  if (!page?.features) return null;

  const heroLines = page.heroTitle.split(/\r?\n/).filter(Boolean);
  const videoLines = page.videoTitle.split(/\r?\n/).filter(Boolean);
  const videoId = youtubeId(page.videoUrl);
  const features = page.features;

  return (
    <div className={PAGE_BOTTOM}>
      {/* 1. Hero — text on the right (RTL start), phone on the left */}
      <section className="bg-gradient-to-l from-white via-white to-[#fde7eb]">
        <div className="mx-auto grid max-w-[1600px] items-center gap-8 px-[15px] py-10 lg:grid-cols-2 lg:gap-0 lg:py-0">
          <div className="text-center lg:px-10 lg:text-start">
            <h1 className="text-[34px] leading-[1.25] text-black lg:text-[48px]">
              {heroLines.map((line, i) => (
                <span key={i} className={`block ${i === 0 ? "font-light" : "font-bold"}`}>
                  {line}
                </span>
              ))}
            </h1>
            {page.heroText ? <p className="mt-8 max-w-[560px] text-[19px] leading-[1.7] text-black lg:text-[20px]">{page.heroText}</p> : null}
          </div>
          {page.heroImage ? (
            <div className="flex justify-center">
              <Img image={page.heroImage} sizes="(min-width: 1024px) 45vw, 80vw" className="h-auto w-[280px] lg:w-[460px]" />
            </div>
          ) : null}
        </div>
      </section>

      {/* 2. Download band */}
      <section className={`${RED} text-white`}>
        <div className="mx-auto flex max-w-[1600px] flex-col items-center justify-center gap-6 px-[15px] py-8 lg:flex-row lg:justify-between lg:px-[160px] lg:py-10">
          <h2 className="text-[40px] font-bold leading-[1.1] lg:text-[48px]">{page.downloadTitle}</h2>
          <StoreBadges page={page} />
        </div>
      </section>

      {/* 3. Why register — 4 numbered benefits around a centre image (grid-placed on desktop, stacked on mobile) */}
      {features.length > 0 ? (
        <section className="mx-auto max-w-[1600px] px-[15px] py-12 lg:py-16">
          <h2 className="mb-10 text-center text-[32px] font-normal leading-[1.2] text-black lg:mb-14 lg:text-[48px]">{page.featuresTitle}</h2>
          <div className="grid gap-8 lg:grid-cols-[1fr_minmax(0,440px)_1fr] lg:gap-x-10 lg:gap-y-16">
            {page.featuresImage ? (
              <div className="flex justify-center lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:items-center">
                <Img image={page.featuresImage} sizes="(min-width: 1024px) 440px, 80vw" className="h-auto w-full max-w-[440px]" />
              </div>
            ) : null}
            {features.map((f, i) => (
              <article
                key={i}
                // RTL: column 1 is the right side → items 1,2 right, 3,4 left.
                className={`relative ps-[90px] lg:ps-[100px] ${i < 2 ? "lg:col-start-1" : "lg:col-start-3"} ${i % 2 === 0 ? "lg:row-start-1" : "lg:row-start-2"}`}
              >
                <span
                  aria-hidden="true"
                  className="absolute start-0 top-0 flex h-[76px] w-[76px] items-center justify-center rounded-full bg-[#fde7eb] text-[56px] font-bold leading-none text-[#d52027] lg:-top-4 lg:h-[88px] lg:w-[88px] lg:text-[64px]"
                >
                  {i + 1}
                </span>
                <h3 className="text-[22px] font-bold leading-[1.4] text-black lg:text-[24px]">{f.title}</h3>
                <p className="mt-3 text-[18px] leading-[1.8] text-black lg:text-[19px]">{f.text}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {/* 4. Coupon */}
      {page.couponCode ? (
        <section className="mx-auto flex max-w-[1600px] flex-col items-center justify-between gap-6 px-[15px] py-10 lg:flex-row lg:px-[160px] lg:py-14">
          <div className="flex flex-wrap items-center justify-center gap-5">
            <p className="text-[26px] font-bold text-black lg:text-[32px]">{page.couponText}</p>
            <span dir="ltr" className={`${RED} rounded-full px-10 py-2.5 text-[24px] font-bold text-white`}>
              {page.couponCode}
            </span>
          </div>
          {page.couponLabel ? (
            <p dir="ltr" className="text-[44px] font-extrabold leading-none text-black lg:text-[72px]">
              {page.couponLabel}
            </p>
          ) : null}
        </section>
      ) : null}

      {/* 5. Video + download panel — video on the right, red panel on the left (RTL) */}
      <section className="grid lg:min-h-[540px] lg:grid-cols-2">
        <div className="relative aspect-video lg:aspect-auto">
          {videoId ? <AppVideo videoId={videoId} posterUrl={page.videoPoster?.url} title={videoLines.join(" ")} /> : page.videoPoster ? <Img image={page.videoPoster} sizes="50vw" className="h-full w-full object-cover" /> : null}
        </div>
        <div className={`${RED} flex flex-col justify-between gap-10 px-[25px] py-10 text-white lg:px-[60px] lg:py-[60px]`}>
          <h2 className="text-[34px] leading-[1.3] lg:text-[48px]">
            {videoLines.map((line, i) => (
              <span key={i} className={`block ${i === 0 ? "font-bold" : "font-light"}`}>
                {line}
              </span>
            ))}
          </h2>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
            {page.videoDownloadLabel ? <p className="text-[18px] font-bold">{page.videoDownloadLabel}</p> : null}
            <StoreBadges page={page} />
          </div>
        </div>
      </section>
    </div>
  );
}
