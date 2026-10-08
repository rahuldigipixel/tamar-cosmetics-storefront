import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { getContentPage } from "@/lib/wpgraphql/tamarApi";
import { RichContent } from "@/components/ui/RichContent";
import { CONTENT_PROFILES } from "@/lib/contentPageProfiles";

/** generateMetadata() for a wp-admin "heading + editor" page (shares the page's cached request). */
export async function contentMetadata(route: string, fallbackTitle: string): Promise<Metadata> {
  const page = await getContentPage(route);
  return pageMetadata({ title: page?.heading || fallbackTitle, description: page?.contentHtml, route: `/${route.replace(/-page$/, "")}` });
}

/** Pink title band (#fde7eb, 72px/35px 800 serif title) shared by the content pages. */
export function TitleBand({ heading }: { heading: string }) {
  return (
    <div className="bg-[#fde7eb]">
      <div className="mx-auto max-w-[1600px] px-[10px] pb-0 pt-[10px] text-center sm:px-[15px] lg:py-[10px]">
        <h1 className="font-[family-name:'Times_New_Roman',serif] text-[35px] font-extrabold leading-[35px] text-black lg:text-[72px] lg:leading-[72px]">
          {heading}
        </h1>
      </div>
    </div>
  );
}

interface ContentPageProps {
  /** REST route of the page (includes/class-simple-pages.php). */
  route: string;
  fallbackTitle: string;
  /** Key of CONTENT_PROFILES (measured layout of the legacy page). */
  profile: keyof typeof CONTENT_PROFILES;
}

/**
 * Pink title band (#fde7eb, 72px/35px 800 serif title — the legacy Hebrew title
 * falls back to the browser serif) + the editor content, laid out per profile.
 */
export async function ContentPage({ route, fallbackTitle, profile }: ContentPageProps) {
  const page = await getContentPage(route);
  const heading = page?.heading || fallbackTitle;
  const contentHtml = page?.contentHtml ?? "";
  const p = CONTENT_PROFILES[profile];

  return (
    <div>
      {p.noBand ? (
        <h1 className="sr-only">{heading}</h1>
      ) : (
        <div className="bg-[#fde7eb]">
          <div className="mx-auto max-w-[1600px] px-[10px] pb-0 pt-[10px] text-center sm:px-[15px] lg:py-[10px]">
            <h1 className="font-[family-name:'Times_New_Roman',serif] text-[35px] font-extrabold leading-[35px] text-black lg:text-[72px] lg:leading-[72px]">
              {heading}
            </h1>
          </div>
        </div>
      )}

      {contentHtml ? (
        <div className={`${p.outer} ${p.top} ${p.bottom}`}>
          <RichContent html={contentHtml} className={p.text} />
        </div>
      ) : null}
    </div>
  );
}
