import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { getAboutPage } from "@/lib/wpgraphql/tamarApi";
import { PAGE_TOP, PAGE_BOTTOM } from "@/lib/pageSpacing";
import { CONTENT_PROFILES } from "@/lib/contentPageProfiles";
import { RichContent } from "@/components/ui/RichContent";
import { TitleBand } from "@/components/ui/ContentPageView";
import { AboutImageSlider } from "@/components/about/AboutImageSlider";
import { ImageLightboxGallery } from "@/components/about/ImageLightboxGallery";

export const revalidate = 300;

const FALLBACK_TITLE = "אודות החברה תמר קוסמטיקס";
const ARIAL = "font-[family-name:Arial,Helvetica,sans-serif]";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getAboutPage();
  return pageMetadata({ title: page?.heading || FALLBACK_TITLE, description: page?.contentHtml, route: "/about-company" });
}

/** YouTube watch / short / embed URL → video id. */
function youtubeId(url: string): string | null {
  const m = url.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/);
  return m ? m[1] : null;
}

// Public path is the Hebrew "/אודות-חברה-תמר-קוסמטיקס" (matching the live site) — see the
// rewrite in next.config.ts. Order and sizes measured from the legacy page (1920 / 390):
// video 775px → text (21px, 24px bold centered h2) → 3-up slider → red 35px/20px title +
// 19px/18px description → 4-column lightbox gallery → red title → 3 team cards.
export default async function AboutPage() {
  const page = await getAboutPage();
  const videoId = youtubeId(page?.videoUrl ?? "");
  const sliderImages = page?.slider ?? [];
  const gallery = page?.gallery ?? [];
  const cards = page?.cards ?? [];
  const sectionTitle = "text-center text-[20px] font-normal leading-[30px] text-[#d52027] lg:text-[35px]";

  return (
    <div className={ARIAL}>
      <TitleBand heading={page?.heading || FALLBACK_TITLE} />

      <div className={`mx-auto max-w-[1570px] px-[25px] lg:px-[10px] ${PAGE_TOP} ${PAGE_BOTTOM}`}>
        {videoId ? (
          <div className="mx-auto mb-5 aspect-[775/581] w-full max-w-[775px]">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${videoId}`}
              title="תמר קוסמטיקס"
              loading="lazy"
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="h-full w-full"
            />
          </div>
        ) : null}

        {page?.contentHtml ? <RichContent html={page.contentHtml} className={CONTENT_PROFILES.about.text} /> : null}

        {sliderImages.length > 0 ? (
          <div className="mt-5">
            <AboutImageSlider images={sliderImages} />
          </div>
        ) : null}

        {page?.certTitle ? <h2 className={`mt-5 ${sectionTitle}`}>{page.certTitle}</h2> : null}
        {page?.certText ? (
          <p className="mt-5 whitespace-pre-line text-center text-[18px] leading-[25.2px] text-black lg:text-[19px] lg:leading-[30.4px]">{page.certText}</p>
        ) : null}

        {gallery.length > 0 ? (
          <div className="mt-5">
            <ImageLightboxGallery images={gallery} />
          </div>
        ) : null}

        {page?.teamTitle ? <h2 className={`mt-5 ${sectionTitle}`}>{page.teamTitle}</h2> : null}
        {cards.length > 0 ? (
          <div className="mx-auto mt-[30px] grid max-w-[1514px] gap-[40px] lg:grid-cols-3 lg:gap-x-[37px]">
            {cards.map((card, i) => (
              <div
                key={i}
                className={`rounded-[21px] border-t-[5px] bg-white px-[35px] py-[57.6px] shadow-[0_10px_40px_rgba(41,63,42,0.22)] lg:px-[57.6px] ${
                  i % 2 === 1 ? "border-[#d52027]" : "border-[#fde7eb]"
                }`}
              >
                <h3 className="text-center text-[27px] font-bold leading-[30px] text-black lg:text-right lg:text-[30.72px]">{card.title}</h3>
                {card.text ? (
                  <p className="mt-5 text-justify text-[20px] leading-[32px] text-black lg:text-right lg:text-[21.12px] lg:leading-[33.8px]">{card.text}</p>
                ) : null}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
