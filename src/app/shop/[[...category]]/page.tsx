import { listProducts } from "@/lib/wpgraphql/products";
import { listCategories } from "@/lib/wpgraphql/categories";
import { ProductCard } from "@/components/product/ProductCard";
import Link from "next/link";

export const revalidate = 60;

interface ShopPageProps {
  params: Promise<{ category?: string[] }>;
  searchParams: Promise<{ q?: string }>;
}

export default async function ShopPage({ params, searchParams }: ShopPageProps) {
  const { category: categorySlugs } = await params;
  const { q } = await searchParams;
  const activeCategory = categorySlugs?.[0];

  const [{ products }, categories] = await Promise.all([
    listProducts({ category: activeCategory, search: q }).catch(() => ({
      products: [],
      hasNextPage: false,
      endCursor: null,
    })),
    listCategories().catch(() => []),
  ]);

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <Link
          href="/shop"
          className={`rounded-full border px-4 py-1.5 text-sm ${
            !activeCategory ? "border-brand-accent text-brand-accent" : "border-black/10 hover:border-brand-accent"
          }`}
        >
          הכל
        </Link>
        {categories.filter((c) => !c.parentId).map((category) => (
          <Link
            key={category.id}
            href={`/shop/${category.slug}`}
            className={`rounded-full border px-4 py-1.5 text-sm ${
              activeCategory === category.slug
                ? "border-brand-accent text-brand-accent"
                : "border-black/10 hover:border-brand-accent"
            }`}
          >
            {category.name} ({category.count})
          </Link>
        ))}
      </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <p className="text-black/60">לא נמצאו מוצרים.</p>
      )}
    </div>
  );
}
