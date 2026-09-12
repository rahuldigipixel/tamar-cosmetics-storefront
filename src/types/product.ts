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
  /** Populated once tamar-headless-api tabs endpoint is live; empty until then. */
  tabs: { title: string; content: string }[];
  /** Populated once ACF video field is mapped; empty until then. */
  videoUrl?: string;
  /** First assigned product brand, if any — most products aren't tagged yet. */
  brand?: string;
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
