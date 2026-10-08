import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { getFlagshipPage } from "@/lib/wpgraphql/tamarApi";
import { PAGE_TOP, PAGE_BOTTOM } from "@/lib/pageSpacing";
import { RichContent } from "@/components/ui/RichContent";
import { demoteH1 } from "@/lib/utils/editorHtml";
import { TitleBand } from "@/components/ui/ContentPageView";
import { AboutImageSlider } from "@/components/about/AboutImageSlider";

export const revalidate = 300;

const FALLBACK_TITLE = "סניף תמר קוסמטיקס";
const ARIAL = "font-[family-name:Arial,Helvetica,sans-serif]";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getFlagshipPage();
  return pageMetadata({ title: page?.heading || FALLBACK_TITLE, description: page?.contentHtml, route: "/flagship-branch" });
}

/** YouTube watch / short / embed URL → video id. */
function youtubeId(url: string): string | null {
  const m = url.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/);
  return m ? m[1] : null;
}

/** Admin value is either a full http(s) embed URL or a place/address to search on Google Maps. */
function mapSrc(value: string): string {
  return /^https?:\/\//i.test(value)
    ? value
    : `https://maps.google.com/maps?q=${encodeURIComponent(value)}&t=m&z=20&output=embed&iwloc=near`;
}

// Text styles measured from the legacy page (1920 / 390): 21px/33.6px body, 24px h2, 22px h3,
// 28px bold h1 lines (hours / Waze), 27px Waze icon.
const TEXT =
  "!text-right [&_p]:!mb-5 [&_p:last-child]:!mb-0 [&_li]:!mb-[10px] [&_ul]:!mb-5 [&_strong]:!font-semibold !text-[18px] !leading-[30px] !text-[#0c0c0c] lg:!text-[21px] lg:!leading-[33.6px] " +
  "[&_h1]:!mb-0 [&_h1]:!text-[22px] [&_h1]:!font-bold [&_h1]:!leading-[32px] [&_h1]:!text-[#0c0c0c] lg:[&_h1]:!text-[28px] lg:[&_h1]:!leading-[39.2px] " +
  "[&_h2]:!mb-5 [&_h2]:!mt-0 [&_h2]:!text-[24px] [&_h2]:!font-bold [&_h2]:!leading-[33.6px] [&_h2]:!text-[#0c0c0c] " +
  "[&_h3]:!mb-5 [&_h3]:!mt-0 [&_h3]:!text-[18px] [&_h3]:!font-bold [&_h3]:!leading-[28px] [&_h3]:!text-[#0c0c0c] lg:[&_h3]:!text-[22px] lg:[&_h3]:!leading-[30.8px] " +
  "[&_hr]:my-5 [&_img]:!my-0 [&_img]:!rounded-none [&_img]:!inline-block [&_img]:!w-[27px] [&_a]:!text-inherit [&_a]:!no-underline [&_ul]:list-none [&_ul]:pr-0 [&_ul>li]:relative [&_ul>li]:pr-[26px] [&_ul>li]:before:absolute [&_ul>li]:before:right-[8px] [&_ul>li]:before:top-[0.6em] [&_ul>li]:before:h-[6px] [&_ul>li]:before:w-[6px] [&_ul>li]:before:rounded-full [&_ul>li]:before:bg-black";

// Editor <h1>s are demoted to <h2 data-h1> (one <h1> per page = the title band); give those the same h1 look.
const H1_ALIAS = TEXT.split(" ")
  .filter((c) => c.includes("_h1"))
  .map((c) => c.replace("_h1", "_h2[data-h1]"))
  .join(" ");
const TEXT_H1 = `${TEXT} ${H1_ALIAS}`;

// Public path is the Hebrew "/סניף-הדגל-ירושלים-תמר-קוסמטיקס" (matching the live site) — see the
// rewrite in next.config.ts. Layout (RTL): title band → centered intro → row 1 (products text on the
// right, map on the left) → row 2 (video + hours on the right, visit text on the left) → 3-up slider.
export default async function FlagshipBranchPage() {
  const page = await getFlagshipPage();
  const videoId = youtubeId(page?.videoUrl ?? "");
  const slider = page?.slider ?? [];

  return (
    <div className={ARIAL}>
      <TitleBand heading={page?.heading || FALLBACK_TITLE} />

      <div className={`mx-auto max-w-[1570px] px-[25px] lg:px-[10px] ${PAGE_TOP} ${PAGE_BOTTOM}`}>
        {page?.contentHtml ? <RichContent html={demoteH1(page.contentHtml)} className={`${TEXT_H1} !text-center`} /> : null}

        {page?.productsHtml || page?.mapQuery ? (
          <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,35fr)_minmax(0,65fr)] lg:gap-[25px]">
            <RichContent html={demoteH1(page?.productsHtml ?? "")} className={TEXT_H1} />
            {page?.mapQuery ? (
              <iframe
                src={mapSrc(page.mapQuery)}
                title="מפה"
                loading="lazy"
                allowFullScreen
                className="h-[350px] w-full lg:h-[500px]"
              />
            ) : null}
          </div>
        ) : null}

        {videoId || page?.hoursHtml || page?.visitHtml ? (
          <div className="mt-10 grid gap-10 lg:grid-cols-2 lg:gap-[30px]">
            <div className="flex flex-col justify-between gap-10">
              {videoId ? (
                <div className="aspect-video w-full">
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
              <RichContent
                html={demoteH1(page?.hoursHtml ?? "")}
                className={`${TEXT_H1} !text-center [&_h1:first-child]:underline [&_h2[data-h1]:first-child]:underline`}
              />
            </div>
            <RichContent
              html={demoteH1(page?.visitHtml ?? "")}
              className={`${TEXT_H1} !text-center lg:flex lg:flex-col lg:justify-around`}
            />
          </div>
        ) : null}

        {slider.length > 0 ? (
          <div className="mt-10">
            <AboutImageSlider images={slider} rounded />
          </div>
        ) : null}
      </div>
    </div>
  );
}
