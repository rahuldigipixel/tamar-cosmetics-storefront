import type { Metadata } from "next";
import { Percent, Sparkles, Flame } from "lucide-react";
import { seoToMetadata, jsonLdString, organizationJsonLd } from "@/lib/seo";
import { getHomeData } from "@/lib/wpgraphql/home";
import { getGlobalData } from "@/lib/wpgraphql/tamarApi";
import { resolveIntegrations } from "@/lib/integrations";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { CategorySlider } from "@/components/home/CategorySlider";
import { BrandSlider } from "@/components/home/BrandSlider";
import { FeatureStrip } from "@/components/home/FeatureStrip";
import { ProductSlider } from "@/components/home/ProductSlider";
import { ClubSignup } from "@/components/home/ClubSignup";
import { FlashyReviewsWidget } from "@/components/reviews/FlashyReviewsWidget";
import { RichContent } from "@/components/ui/RichContent";
import type { ProductCategory, Brand } from "@/types/product";

export const revalidate = 60;

const DEFAULT_ABOUT_TITLE = "תמר קוסמטיקס - ציוד למוצרי ציפורניים";
const DEFAULT_ABOUT_HTML =
  "<p>המרכז הארצי לייבוא ושיווק מוצרים לקוסמטיקאיות באונליין</p>" +
  "<p>חנות למוצרי ציפורניים ולק ג&apos;ל, מבחר ענק של מקצועי למניקור, פדיקור וקוסמטיקה.</p>" +
  "<p>תמר קוסמטיקס מייבאת ומשווקת את המותגים האיכותיים והמתקדמים ביותר המחויבים לספק תוצאות. המותגים הללו ידועים בשל האמינות והיכולת לעזור לעצור ולקוחות להשיג את המראה והאפקט הרצויים, תוך שמירה על בריאות העור והציפורניים.</p>";

// Legacy-site typography for the admin-authored about copy: h1 like the title (32px/600, 10px shadow); h2/h4 27px/500 with the 6px shadow
// (h4 is one block of <br>-separated lines, so its 50px line height gives the live site's 50px line pitch); h3 is the bold 22px/600 strapline.
// "!" because RichContent sets its own h2/h3 size, weight and margins.
const ABOUT_CONTENT_CLASS =
  "mx-auto max-w-[1400px] text-center !text-black max-md:!leading-[29px] [&>br:first-child]:hidden " +
  "[&_h1]:!my-0 [&_h1]:!text-[30px] md:[&_h1]:!text-[32px] [&_h1]:!font-semibold [&_h1]:!leading-[30px] [&_h1]:!text-black [&_h1]:[text-shadow:9px_4px_10px_rgba(0,0,0,0.3)] " +
  "[&_:is(h2,h4)]:!my-0 [&_:is(h2,h4)]:!text-[26px] md:[&_:is(h2,h4)]:!text-[27px] [&_:is(h2,h4)]:!font-medium [&_:is(h2,h4)]:!leading-[30px] md:[&_:is(h2,h4)]:!leading-[50px] [&_:is(h2,h4)]:!text-black [&_:is(h2,h4)]:[text-shadow:9px_4px_6px_rgba(0,0,0,0.3)] [&_:is(h2,h4)]:[-webkit-text-stroke-color:#000] " +
  "[&_h3]:!mb-5 [&_h3]:!mt-0 [&_h3]:!text-[22px] [&_h3]:!font-semibold [&_h3]:!leading-[30.8px] [&_h3]:!text-black";

/** Admin-selected slugs, in the admin's chosen order; falls back to the top `limit` by product count when none are selected. */
function pickBySlugOrTopCount<T extends { slug: string; count: number }>(
  items: T[],
  slugs: string[] | undefined,
  limit: number
): T[] {
  if (slugs && slugs.length > 0) {
    const bySlug = new Map(items.map((item) => [item.slug, item]));
    return slugs.map((slug) => bySlug.get(slug)).filter((item): item is T => Boolean(item));
  }
  return [...items].sort((a, b) => b.count - a.count).slice(0, limit);
}

export async function generateMetadata(): Promise<Metadata> {
 const { seo } = await getHomeData();
 return seoToMetadata(seo, {
 path: "/",
 fallback: { title: "תמר קוסמטיקס - חנות למוצרי ציפורניים", description: "תמר קוסמטיקס - חנות למוצרי ציפורניים, פדיקור וגבות" },
 });
}

export default async function HomePage() {
  // Global data (layout, shared via cache()) + ONE page-body request: settings,
  // curated rails, categories and brands all come from getHomeData().
  const [homeData, global] = await Promise.all([getHomeData(), getGlobalData()]);
  const integrations = resolveIntegrations(global?.settings);

  const { settings, categories, brands } = homeData;

  // Out-of-stock items shouldn't take up slots in these promotional home-page sliders.
  const hotProducts = homeData.hotProducts.filter((p) => p.inStock);
  const newSectionProducts = homeData.newProducts.filter((p) => p.inStock);
  const saleSectionProducts = homeData.saleProducts.filter((p) => p.inStock);

  // Admin picks by term ID (see class-home-page-settings.php), so a selection
  // can be a subcategory too — match against every category, any depth, not
  // just top-level ones. Only the no-selection default restricts to
  // top-level categories (sorted by product count), since those are the ones
  // that make sense as a generic "browse by category" fallback.
  const allCategories: ProductCategory[] = categories.map((c) => ({ ...c, description: undefined }));
  const topLevelCategories = allCategories.filter((c) => !c.parentId);
  const hasCategorySelection = Boolean(settings?.categorySlugs && settings.categorySlugs.length > 0);
  const displayCategories = hasCategorySelection
    ? pickBySlugOrTopCount(allCategories, settings!.categorySlugs, 10)
    : pickBySlugOrTopCount(topLevelCategories, undefined, 10);

  const brandsWithLogo: Brand[] = brands.filter((b) => b.thumbnailUrl);
  const displayBrands = pickBySlugOrTopCount(brandsWithLogo, settings?.brandSlugs, 20);

  const aboutTitle = settings?.aboutTitle || DEFAULT_ABOUT_TITLE;
  const aboutHtml = settings?.aboutContentHtml || DEFAULT_ABOUT_HTML;

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(organizationJsonLd()) }} />
      {/* Every page needs exactly one <h1>: use the about title unless the admin-authored about content already has one. */}
      {/<h1[\s>]/i.test(aboutHtml) ? null : <h1 className="sr-only">{aboutTitle}</h1>}
      <HeroCarousel desktopSlides={settings?.heroDesktop} mobileSlides={settings?.heroMobile} />

      <CategorySlider categories={displayCategories} heading={settings?.categoryHeading} />

      <BrandSlider brands={displayBrands} heading={settings?.brandHeading} />

      <ProductSlider
        badge="הכי נמכרים"
        badgeIcon={<Flame className="h-3.5 w-3.5" />}
        title={settings?.hot.title || "HOT"}
        description={settings?.hot.description || "אספנו לך את כל המוצרים הכי חמים באתר:"}
        products={hotProducts}
        headerVariant="modern"
      />

      <ClubSignup
        heading={settings?.club.heading}
        description={settings?.club.description}
        bgImageUrl={settings?.club.bgImage?.url}
      />

      <ProductSlider
        badge="NEW"
        badgeIcon={<Sparkles className="h-3.5 w-3.5" />}
        title={settings?.new.title || "NEW"}
        description={settings?.new.description || "המוצרים החדשים שעלו לאתר:"}
        products={newSectionProducts}
        headerVariant="modern"
        autoplayMs={6000}
      />

      <ProductSlider
        badge="SALE"
        badgeIcon={<Percent className="h-3.5 w-3.5" />}
        title={settings?.sale.title || "המבצעים שלנו"}
        description={settings?.sale.description}
        products={saleSectionProducts}
        headerVariant="modern"
        singleOnMobile
      />

      {/* Margins collapse with FeatureStrip's own my-[25px], so the wrapper sets the full 50/60px gap above; the about section's pt tops up the 25px below. */}
      <div className="mt-[50px] md:mt-[60px]">
        <FeatureStrip features={settings?.features} />
      </div>

      <section className="mx-auto max-w-[1600px] px-[15px] pb-0 pt-[25px] text-center md:pt-[35px]">
        <h2 className="mb-4 text-[30px] font-semibold leading-[30px] md:text-[32px] text-black [text-shadow:9px_4px_10px_rgba(0,0,0,0.3)]">{aboutTitle}</h2>
        <RichContent html={aboutHtml} className={ABOUT_CONTENT_CLASS} />
      </section>

      <section className="w-full bg-white pb-0 pt-[50px] md:pt-[60px]">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
          <FlashyReviewsWidget elementId={integrations.flashyReviewsElementId} legacyOrigin={integrations.flashyLegacySiteOrigin} />
        </div>
      </section>
    </div>
  );
}
