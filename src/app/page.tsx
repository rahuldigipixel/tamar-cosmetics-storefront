import { Percent, Sparkles, Flame } from "lucide-react";
import { getHomeData } from "@/lib/wpgraphql/home";
import { getHomePageSettings } from "@/lib/wpgraphql/tamarApi";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { CategorySlider } from "@/components/home/CategorySlider";
import { BrandSlider } from "@/components/home/BrandSlider";
import { FeatureStrip } from "@/components/home/FeatureStrip";
import { ProductSlider } from "@/components/home/ProductSlider";
import { SaleProductSlider } from "@/components/home/SaleProductSlider";
import { ClubSignup } from "@/components/home/ClubSignup";
import { FlashyReviewsWidget } from "@/components/reviews/FlashyReviewsWidget";
import { RichContent } from "@/components/ui/RichContent";
import type { Product, ProductCategory, Brand } from "@/types/product";

export const revalidate = 60;

const DEFAULT_ABOUT_TITLE = "תמר קוסמטיקס - ציוד למוצרי ציפורניים";
const DEFAULT_ABOUT_HTML =
  "<p>המרכז הארצי לייבוא ושיווק מוצרים לקוסמטיקאיות באונליין</p>" +
  "<p>חנות למוצרי ציפורניים ולק ג&apos;ל, מבחר ענק של מקצועי למניקור, פדיקור וקוסמטיקה.</p>" +
  "<p>תמר קוסמטיקס מייבאת ומשווקת את המותגים האיכותיים והמתקדמים ביותר המחויבים לספק תוצאות. המותגים הללו ידועים בשל האמינות והיכולת לעזור לעצור ולקוחות להשיג את המראה והאפקט הרצויים, תוך שמירה על בריאות העור והציפורניים.</p>";

/** Admin's manually-picked products for a rail (wp-admin → ניהול דף הבית), falling back to the section's default product list when nothing's been picked. */
function pickRailProducts(selected: Product[], fallback: Product[]): Product[] {
  return selected.length > 0 ? selected : fallback;
}

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

export default async function HomePage() {
  // Settings (wp-admin's HOT/NEW/SALE product-id picks) has to resolve
  // before the GraphQL call below, since those ids feed the $hotIds/$newIds/
  // $saleIds variables on GET_HOME_DATA — still just the same 2 requests
  // this route has always made (settings REST + GraphQL), just sequential.
  const settings = await getHomePageSettings();

  const {
    saleProducts: saleProductsRaw,
    bestSellers: bestSellersRaw,
    newProducts: newProductsRaw,
    hotSelected: hotSelectedRaw,
    newSelected: newSelectedRaw,
    saleSelected: saleSelectedRaw,
    categories,
    brands,
  } = await getHomeData(20, {
    hot: settings?.hot.productIds,
    new: settings?.new.productIds,
    sale: settings?.sale.productIds,
  });

  // Out-of-stock items shouldn't take up slots in these promotional home-page sliders.
  const saleProducts = saleProductsRaw.filter((p) => p.inStock);
  const bestSellers = bestSellersRaw.filter((p) => p.inStock);
  const newProducts = newProductsRaw.filter((p) => p.inStock);
  const hotSelected = hotSelectedRaw.filter((p) => p.inStock);
  const newSelected = newSelectedRaw.filter((p) => p.inStock);
  const saleSelected = saleSelectedRaw.filter((p) => p.inStock);

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

  const hotProducts = pickRailProducts(hotSelected, bestSellers);
  const newSectionProducts = pickRailProducts(newSelected, newProducts);
  const saleSectionProducts = pickRailProducts(saleSelected, saleProducts);

  const aboutTitle = settings?.aboutTitle || DEFAULT_ABOUT_TITLE;
  const aboutHtml = settings?.aboutContentHtml || DEFAULT_ABOUT_HTML;

  return (
    <div>
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

      <SaleProductSlider
        badge="SALE"
        badgeIcon={<Percent className="h-3.5 w-3.5" />}
        title={settings?.sale.title || "המבצעים שלנו"}
        description={settings?.sale.description}
        products={saleSectionProducts}
      />

      <ProductSlider
        badge="SALE"
        badgeIcon={<Percent className="h-3.5 w-3.5" />}
        title={settings?.sale.title || "המבצעים שלנו"}
        description={settings?.sale.description}
        products={saleSectionProducts}
        headerVariant="modern"
      />

      <FeatureStrip features={settings?.features} />

      <section className="mx-auto max-w-[1600px] px-[15px] py-10 text-center sm:py-[50px]">
        <h2 className="mb-4 text-[28px] font-bold text-[#242424] sm:text-[36px]">{aboutTitle}</h2>
        <RichContent html={aboutHtml} className="mx-auto max-w-3xl text-center" />
      </section>

      <section className="w-full bg-white py-8 sm:py-[50px]">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
          <FlashyReviewsWidget />
        </div>
      </section>
    </div>
  );
}
