// Per-page layout of the wp-admin "heading + editor" pages, measured from the
// legacy site with Playwright (desktop 1920px / mobile 390px). Class strings are
// literal on purpose so Tailwind can see them. Several sizes are below the 18px
// floor / differ per page at the user's explicit request (see AGENTS.md).
import { PAGE_TOP, PAGE_BOTTOM } from "@/lib/pageSpacing";

export interface ContentProfile {
  /** Gap between the pink title band and the content (shared, see pageSpacing.ts). */
  top: string;
  /** Space between the content and the footer (shared, see pageSpacing.ts). */
  bottom: string;
  /** Outer container classes. */
  outer: string;
  /** Classes for the rich-text element (width, font sizes, heading/list/image styles). */
  text: string;
  /** No pink title band (landing-style page); the heading is then only used for the tab title. */
  noBand?: boolean;
}

const OUTER = "mx-auto max-w-[1570px] px-[25px] lg:px-[10px]";

// Shared by every page: black text, 20px paragraph spacing, 10px list-item spacing, embeds and images.
const COMMON =
  "!text-right font-[family-name:Arial,Helvetica,sans-serif] [&_p]:!mb-5 [&_*:last-child]:!mb-0 [&_li]:!mb-[10px] [&_ul]:!mb-5 [&_ol]:!mb-5 [&_strong]:!font-semibold [&_b]:!font-bold [&_hr]:my-5 [&_img]:!my-0 [&_img]:!rounded-none [&_img]:mx-auto [&_img]:block [&_img]:h-auto [&_img]:max-w-full [&_iframe]:h-[450px] [&_iframe]:w-full [&_.video]:mx-auto [&_.video]:max-w-[775px] [&_.video_iframe]:aspect-[4/3] [&_.video_iframe]:h-auto";

// A paragraph holding 2+ consecutive images (editor output: <p><img><img>…</p> or linked images) becomes a swipeable strip.
const STRIP_IMG =
  "[&_p:has(>img+img)]:flex [&_p:has(>img+img)]:gap-4 [&_p:has(>img+img)]:overflow-x-auto [&_p:has(>img+img)]:snap-x [&_p:has(>img+img)>img]:!m-0 [&_p:has(>img+img)>img]:w-full [&_p:has(>img+img)>img]:shrink-0 [&_p:has(>img+img)>img]:snap-start lg:[&_p:has(>img+img)>img]:w-[calc((100%-2rem)/3)]";
const STRIP_LINK =
  "[&_p:has(>a+a>img)]:flex [&_p:has(>a+a>img)]:gap-4 [&_p:has(>a+a>img)]:overflow-x-auto [&_p:has(>a+a>img)]:snap-x [&_p:has(>a+a>img)>a]:w-full [&_p:has(>a+a>img)>a]:shrink-0 [&_p:has(>a+a>img)>a]:snap-start lg:[&_p:has(>a+a>img)>a]:w-[calc((100%-2rem)/3)] [&_p:has(>a+a>img)_img]:!m-0 [&_p:has(>a+a>img)_img]:w-full";

const T19 = "!text-[18px] !leading-[30px] !text-black lg:!text-[19px]";
const T21 = "!text-[21px] !leading-[33.6px] !text-[#0c0c0c]";

export const CONTENT_PROFILES: Record<string, ContentProfile> = {
  // תנאי אחריות מוצרי חשמל: text column 1219px on the right, 19px/30px
  warranty: { top: PAGE_TOP, bottom: PAGE_BOTTOM, outer: OUTER, text: `${COMMON} max-w-[1219px] ${T19}` },
  // משלוחים בירושלים: centered 19px/30px, two-line 72px title
  centered: { top: PAGE_TOP, bottom: PAGE_BOTTOM, outer: OUTER, text: `${COMMON} ${T19}` },
  // הצהרת נגישות: full width 19px/30px, content starts 20px under the band
  accessibility: { top: PAGE_TOP, bottom: PAGE_BOTTOM, outer: OUTER, text: `${COMMON} ${T19} [&_a]:!text-black [&_a]:!no-underline` },
  // שירות איסוף עצמי: centered column 1328px
  pickup: { top: PAGE_TOP, bottom: PAGE_BOTTOM, outer: OUTER, text: `${COMMON} mx-auto max-w-[1328px] ${T19}` },
  // תקנון קוד קופון: 21px/33.6px #0c0c0c
  coupon: { top: PAGE_TOP, bottom: PAGE_BOTTOM, outer: OUTER, text: `${COMMON} ${T21}` },
  // אודות: 21px body, 24px/33.6px bold centered h2, centered video, images
  about: {
    top: PAGE_TOP,
    bottom: PAGE_BOTTOM,
    outer: OUTER,
    text: `${COMMON} ${T21} [&_h2]:!mb-5 [&_h2]:!mt-0 [&_h2]:!text-[24px] [&_h2]:!font-bold [&_h2]:!leading-[33.6px] [&_h2]:!text-[#0c0c0c] [&_a]:!font-semibold [&_a]:!text-[#0000ff] [&_img]:my-5 ${STRIP_IMG}`,
  },
  // סניף הדגל: 21px centered body, 24px h2, 22px h3, 28px bold h1 lines, map + photo grid
  flagship: {
    top: PAGE_TOP,
    bottom: PAGE_BOTTOM,
    outer: OUTER,
    text: `${COMMON} ${T21} [&_h1]:!mb-0 [&_h1]:!text-[28px] [&_h1]:!font-bold [&_h1]:!leading-[39.2px] [&_h1]:!text-[#0c0c0c] [&_h2]:!mb-5 [&_h2]:!mt-0 [&_h2]:!text-[24px] [&_h2]:!font-bold [&_h2]:!leading-[33.6px] [&_h2]:!text-[#0c0c0c] [&_h3]:!mb-5 [&_h3]:!text-[22px] [&_h3]:!font-bold [&_h3]:!leading-[30.8px] [&_h3]:!text-[#0c0c0c] [&_h1_img]:!inline-block [&_h1_img]:!mx-0 [&_h1_img]:!w-[27px] [&_ul]:list-none [&_ul]:pr-0 ${STRIP_LINK}`,
  },
  // תשלומים בכרטיס אשראי: centered 19px/26.22px with 16px paragraph margins; key lines are 24px bold Arial spans (red #ba0000 counts) in the page content
  creditCard: { top: PAGE_TOP, bottom: PAGE_BOTTOM, outer: OUTER, text: `${COMMON} !text-[18px] !leading-[26.22px] !text-black lg:!text-[19px] [&_p:not([data-x])]:!mb-4 [&_p:not([data-x]):last-child]:!mb-0` },
  // תו אמון הציבור: centered 200px badge, 19px/30px intro lines, 15px/24px list (18px on mobile)
  trustSeal: {
    top: PAGE_TOP,
    bottom: PAGE_BOTTOM,
    outer: OUTER,
    text: `${COMMON} !text-black [&_img]:!w-[200px] [&_h2]:!mb-5 [&_h2]:!mt-0 [&_h2]:!text-[18px] [&_h2]:!font-normal [&_h2]:!leading-[30px] lg:[&_h2]:!text-[19px] [&_p]:!text-[18px] [&_p]:!leading-[18px] lg:[&_p]:!text-[15px] lg:[&_p]:!leading-[24px]`,
  },
  // אפליקציית תמר: landing-style page, no title band (best-effort generic layout)
  app: {
    top: PAGE_TOP,
    bottom: PAGE_BOTTOM,
    outer: "mx-auto max-w-[1200px] px-[25px]",
    noBand: true,
    text: `${COMMON} !text-center !text-[18px] !leading-[27px] !text-[#0c0c0c] [&_h2]:!mb-3 [&_h2]:!mt-8 [&_h2]:!text-[30px] [&_h2]:!font-light [&_h2]:!leading-[36px] lg:[&_h2]:!text-[38px] lg:[&_h2]:!leading-[44px] [&_h3]:!my-3 [&_h3]:!text-[28px] [&_h3]:!font-extrabold [&_h3]:!text-[#d52027] [&_img]:my-6 [&_img]:!max-w-[420px] [&_a:has(>img)]:inline-block [&_a:has(>img)>img]:!my-2 [&_a:has(>img)>img]:!max-w-[180px]`,
  },
};
