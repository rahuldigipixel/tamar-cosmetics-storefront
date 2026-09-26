import { Percent, Sparkles, Flame } from "lucide-react";
import { listProducts } from "@/lib/wpgraphql/products";
import { listCategories } from "@/lib/wpgraphql/categories";
import { listBrands } from "@/lib/wpgraphql/brands";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { CategorySlider } from "@/components/home/CategorySlider";
import { BrandSlider } from "@/components/home/BrandSlider";
import { FeatureStrip } from "@/components/home/FeatureStrip";
import { ProductSlider } from "@/components/home/ProductSlider";
import { SaleProductSlider } from "@/components/home/SaleProductSlider";
import { ClubSignup } from "@/components/home/ClubSignup";
import { SaleShowcase } from "@/components/home/SaleShowcase";
import { CustomerReviews } from "@/components/home/CustomerReviews";

export const revalidate = 60;

const EMPTY_LIST = { products: [], hasNextPage: false, endCursor: null };

export default async function HomePage() {
  const [{ products: saleProducts }, { products: bestSellers }, { products: newProducts }, categories, brands] =
    await Promise.all([
      listProducts({ onSale: true, first: 20 }).catch(() => EMPTY_LIST),
      listProducts({ first: 20, orderby: [{ field: "POPULARITY", order: "DESC" }] }).catch(() => EMPTY_LIST),
      listProducts({ first: 20, orderby: [{ field: "DATE", order: "DESC" }] }).catch(() => EMPTY_LIST),
      listCategories().catch(() => []),
      listBrands().catch(() => []),
    ]);

  return (
    <div>
      <HeroCarousel />

      <CategorySlider
        categories={categories
          .filter((c) => !c.parentId)
          .slice(0, 20)
          .map((c) => ({ ...c, description: undefined }))}
      />

      <BrandSlider brands={brands.filter((b) => b.thumbnailUrl).slice(0, 20)} />

      <ProductSlider
        badge="הכי נמכרים"
        badgeIcon={<Flame className="h-3.5 w-3.5" />}
        title="HOT"
        description="אספנו לך את כל המוצרים הכי חמים באתר:"
        products={bestSellers}
        headerVariant="modern"
      />

      <ClubSignup /> 

      <ProductSlider
        badge="NEW"
        badgeIcon={<Sparkles className="h-3.5 w-3.5" />}
        title="NEW"
         description="המוצרים החדשים שעלו לאתר:"
        products={newProducts}
        headerVariant="modern"
      />


      <SaleProductSlider
        badge="SALE"
        badgeIcon={<Percent className="h-3.5 w-3.5" />}
        title="המבצעים שלנו"
        products={saleProducts}
      /> 

      <SaleShowcase products={saleProducts.slice(0, 10)} />    

      

      


      <FeatureStrip />

      <section className="mx-auto max-w-[1600px] px-[15px] py-10 text-center sm:py-[50px]">
        <h2 className="mb-4 text-[28px] font-bold text-[#242424] sm:text-[36px]">תמר קוסמטיקס - ציוד למוצרי ציפורניים</h2>
        <p className="mx-auto mb-3 max-w-3xl text-[18px] leading-relaxed text-black/70">
          המרכז הארצי לייבוא ושיווק מוצרים לקוסמטיקאיות באונליין
        </p>
        <p className="mx-auto mb-3 max-w-3xl text-[18px] leading-relaxed text-black/70">
          חנות למוצרי ציפורניים ולק ג&apos;ל, מבחר ענק של מקצועי למניקור, פדיקור וקוסמטיקה.
        </p>
        <p className="mx-auto max-w-3xl text-[18px] leading-relaxed text-black/70">
          תמר קוסמטיקס מייבאת ומשווקת את המותגים האיכותיים והמתקדמים ביותר המחויבים לספק
          תוצאות. המותגים הללו ידועים בשל האמינות והיכולת לעזור לעצור ולקוחות להשיג את המראה
          והאפקט הרצויים, תוך שמירה על בריאות העור והציפורניים.
        </p>
      </section>

      <CustomerReviews />
    </div>
  );
}
