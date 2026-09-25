import { Percent, Sparkles, Flame } from "lucide-react";
import { listProducts } from "@/lib/wpgraphql/products";
import { listCategories } from "@/lib/wpgraphql/categories";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { CategorySlider } from "@/components/home/CategorySlider";
import { FeatureStrip } from "@/components/home/FeatureStrip";
import { ProductSlider } from "@/components/home/ProductSlider";
import { SaleProductSlider } from "@/components/home/SaleProductSlider";
import { ClubSignup } from "@/components/home/ClubSignup";
import { SaleShowcase } from "@/components/home/SaleShowcase";
import { CustomerReviews } from "@/components/home/CustomerReviews";

export const revalidate = 60;

const EMPTY_LIST = { products: [], hasNextPage: false, endCursor: null };

export default async function HomePage() {
  const [{ products: saleProducts }, { products: bestSellers }, { products: newProducts }, categories] =
    await Promise.all([
      listProducts({ onSale: true, first: 20 }).catch(() => EMPTY_LIST),
      listProducts({ first: 20, orderby: [{ field: "POPULARITY", order: "DESC" }] }).catch(() => EMPTY_LIST),
      listProducts({ first: 20, orderby: [{ field: "DATE", order: "DESC" }] }).catch(() => EMPTY_LIST),
      listCategories().catch(() => []),
    ]);

  return (
    <div>
      <HeroCarousel />

      <CategorySlider
        categories={categories
          .filter((c) => !c.parentId)
          .slice(0, 10)
          // Client component — don't serialize each category's HTML description into the page.
          .map((c) => ({ ...c, description: undefined }))}
      />

      <ProductSlider
        badge="הכי נמכרים"
        badgeIcon={<Flame className="h-3.5 w-3.5" />}
        title="הכי אהובים עלינו"
        description=""
        products={bestSellers}
        headerVariant="modern"
      /> 

      <SaleProductSlider
        badge="SALE"
        badgeIcon={<Percent className="h-3.5 w-3.5" />}
        title="המבצעים שלנו"
        products={saleProducts}
      /> 

      <SaleShowcase products={saleProducts.slice(0, 10)} />    

      <ClubSignup /> 

      <ProductSlider
        badge="NEW"
        badgeIcon={<Sparkles className="h-3.5 w-3.5" />}
        title="חדש באתר"
        products={newProducts}
        headerVariant="modern"
      />



      <FeatureStrip />

      <CustomerReviews />
    </div>
  );
}
