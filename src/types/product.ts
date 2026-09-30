export interface ProductImage {
  id: string;
  src: string;
  alt: string;
}

export interface ProductLabel {
  text: string;
  color?: string;
  background?: string;
}

export interface ProductAttribute {
  id: string;
  name: string;
  label: string;
  options: string[];
  /** Display names of a global attribute's terms (`options` holds their raw slugs) — only set on the product page query. */
  optionNames?: string[];
  /** Image URL of each term (same order as `optionNames`), when one is set in wp-admin — e.g. the brand logo. */
  optionImages?: (string | null)[];
  /** Term slugs (same order as `optionNames`) — e.g. for linking the brand to its page. */
  optionSlugs?: string[];
  variation: boolean;
}

export interface ProductVariation {
  id: string;
  databaseId: number;
  name: string;
  price: string;
  regularPrice: string;
  salePrice?: string;
  inStock: boolean;
  attributes: { name: string; value: string }[];
  image?: ProductImage;
}

export interface Product {
  id: string;
  databaseId: number;
  slug: string;
  name: string;
  sku?: string;
  /** ACF `barcode` meta — product page query only. */
  barcode?: string;
  /** ACF `tip_description` ("Tamar Tip") — product page query only. */
  tamarTip?: string;
  /** Coupon promoted on the product page (wps-woo-extended "show in product" coupon) — product page query only. */
  coupon?: { code: string; label: string };
  type: "simple" | "variable";
  shortDescription?: string;
  description?: string;
  price: string;
  regularPrice: string;
  salePrice?: string;
  onSale: boolean;
  inStock: boolean;
  currency: string;
  images: ProductImage[];
  categories: { id: string; name: string; slug: string }[];
  labels: ProductLabel[];
  attributes: ProductAttribute[];
  variations: ProductVariation[];
  /** YITH Tab Manager tabs with content for this product (GraphQL `tamarTabs`); detail query only. */
  tabs: { title: string; content: string }[];
  /** Populated once ACF video field is mapped; empty until then. */
  videoUrl?: string;
  /** First assigned product brand, if any — most products aren't tagged yet. */
  brand?: string;
  /** Logo/thumbnail of the first assigned brand term, if set in the pa_brand taxonomy. */
  brandLogoUrl?: string;
  /** Raw WooCommerce weight, in the shop's configured unit (e.g. grams) — unset for most products. */
  weight?: string;
  averageRating?: number;
  reviewCount?: number;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  count: number;
  parentId?: string;
}

export interface Brand {
  id: string;
  databaseId: number;
  name: string;
  slug: string;
  count: number;
  /** Rich-text term description (contains a legacy inline logo image on some brands) — not shown; use thumbnailUrl instead. */
  description?: string;
  thumbnailUrl?: string;
  desktopBannerUrl?: string;
  mobileBannerUrl?: string;
  /** Shown after the product list on the brand's product-list page. */
  extraDescription?: string;
}
