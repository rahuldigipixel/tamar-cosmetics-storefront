import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types/product";

function formatPrice(value: string, currency: string) {
  const numeric = Number(value);
  return new Intl.NumberFormat("he-IL", { style: "currency", currency }).format(
    Number.isNaN(numeric) ? 0 : numeric
  );
}

export function ProductCard({ product }: { product: Product }) {
  const image = product.images[0];

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-black/5 bg-white transition-shadow hover:shadow-lg"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-brand-soft/30">
        {image ? (
          <Image
            src={image.src}
            alt={image.alt || product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-transform group-hover:scale-105"
          />
        ) : null}

        {product.labels.map((label, i) => (
          <span
            key={i}
            className="absolute top-2 end-2 rounded px-2 py-1 text-xs font-semibold text-white"
            style={{ background: label.background ?? "var(--brand-accent)", color: label.color }}
          >
            {label.text}
          </span>
        ))}
        {!product.labels.length && product.onSale ? (
          <span className="absolute top-2 end-2 rounded bg-brand-accent px-2 py-1 text-xs font-semibold text-white">
            מבצע
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3 text-right">
        <h3 className="line-clamp-2 text-sm font-medium">{product.name}</h3>
        <div className="mt-auto flex items-baseline gap-2">
          {product.onSale && product.salePrice ? (
            <>
              <span className="font-semibold text-brand-accent">{formatPrice(product.salePrice, product.currency)}</span>
              <span className="text-xs text-black/40 line-through">
                {formatPrice(product.regularPrice, product.currency)}
              </span>
            </>
          ) : (
            <span className="font-semibold">{formatPrice(product.price, product.currency)}</span>
          )}
        </div>
        {!product.inStock ? <span className="text-xs text-black/50">אזל מהמלאי</span> : null}
      </div>
    </Link>
  );
}
