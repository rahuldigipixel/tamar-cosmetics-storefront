import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { listProducts } from "@/lib/wpgraphql/products";
import { listCategories } from "@/lib/wpgraphql/categories";
import { CategoryProductGrid } from "@/components/product/CategoryProductGrid";

export const revalidate = 60;

interface CategoryPageProps {
  params: Promise<{ slug: string[] }>;
}

// Hebrew URL segments can reach this page under different Unicode
// normalization forms than the plain text WPGraphQL returns for `slug`
// (visually identical, byte-different) — a bare `===` silently never
// matches, which was breaking the category lookup below (title, image, and
// description all fell back to "not found") even though the separate
// product-list query still matched fine server-side. Normalizing both
// sides before comparing fixes that.
function normalizeSlug(slug: string) {
  return slug.normalize("NFC");
}

export default async function ProductCategoryPage({ params }: CategoryPageProps) {
  const { slug: slugPath } = await params;
  const activeSlug = normalizeSlug(slugPath[slugPath.length - 1]);

  const [{ products, hasNextPage, endCursor }, allCategories] = await Promise.all([
    listProducts({ category: activeSlug, first: 20 }),
    listCategories().catch(() => []),
  ]);

  // Sourced from the same full category list that powers the header's
  // brands mega-menu (rather than a dedicated by-slug lookup query) —
  // WPGraphQL's productCategories(where: { slug }) unreliably returns null
  // for child categories, while this list is already known-good.
  const category = allCategories.find((c) => normalizeSlug(c.slug) === activeSlug) ?? null;

  // Fallback for when even that list-based lookup misses (seen in practice
  // for some child categories despite the slug normalization above) — the
  // products query, run against this exact slug, is proof positive of a
  // match, and each product carries its own categories with name+slug. No
  // image/description this way, but the real name beats the raw-slug guess.
  const categoryFromProducts = category
    ? null
    : products.flatMap((p) => p.categories).find((c) => normalizeSlug(c.slug) === activeSlug) ?? null;

  if (!category && !categoryFromProducts && products.length === 0) notFound();

  const title = category?.name ?? categoryFromProducts?.name ?? decodeURIComponent(activeSlug).replace(/-/g, " ");
  const categoryBySlug = new Map(allCategories.map((c) => [normalizeSlug(c.slug), c.name]));
  const breadcrumbSlugs = slugPath.slice(0, -1).map(normalizeSlug);

  return (
    <div>
      <div className="border-b border-black/5 bg-gradient-to-br from-brand-soft/60 via-brand-soft/20 to-white">
        <div className="mx-auto max-w-[1400px] px-4 py-4 sm:px-6">
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{title}</h1>

          <nav className="mt-1.5 flex flex-wrap items-center gap-1.5 text-base text-black/50">
            <Link href="/" className="hover:text-brand-accent">
              בית
            </Link>
            {breadcrumbSlugs.map((s, i) => (
              <span key={s} className="flex items-center gap-1.5">
                <span>/</span>
                <Link
                  href={`/product-category/${breadcrumbSlugs.slice(0, i + 1).join("/")}/`}
                  className="hover:text-brand-accent"
                >
                  {categoryBySlug.get(s) ?? decodeURIComponent(s)}
                </Link>
              </span>
            ))}
            <span>/</span>
            <span className="text-black/80">{title}</span>
          </nav>
        </div>
      </div>

      {category?.image || category?.description ? (
        <div className="border-b border-black/5">
          <div className="mx-auto max-w-[1400px] px-4 py-8 text-center sm:px-6">
            {category.image ? (
              <div className="relative mx-auto mb-5 h-16 w-40 sm:h-20 sm:w-52">
                <Image src={category.image} alt={category.name} fill sizes="208px" className="object-contain" />
              </div>
            ) : null}
            {category.description ? (
              <div
                className="prose prose-sm mx-auto max-w-3xl text-base leading-relaxed text-black/70 [&_p]:mb-2"
                dangerouslySetInnerHTML={{ __html: category.description }}
              />
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="mx-auto max-w-[1400px] px-4 py-8 pb-12 sm:px-6">
        <CategoryProductGrid
          categorySlug={activeSlug}
          initialProducts={products}
          initialHasNextPage={hasNextPage}
          initialEndCursor={endCursor}
        />
      </div>
    </div>
  );
}
