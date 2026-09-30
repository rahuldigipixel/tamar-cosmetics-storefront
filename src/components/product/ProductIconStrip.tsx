import Image from "next/image";
import Link from "next/link";
import type { ProductStripItem } from "@/lib/wpgraphql/products";

/**
 * Full-width icon strip under the product tabs — managed in wp-admin → הגדרות
 * עמוד מוצר. Image, title and link are each optional; only what is set renders.
 */
export function ProductIconStrip({ items }: { items: ProductStripItem[] }) {
  if (items.length === 0) return null;

  return (
    <section className="mt-[40px] w-full border-y border-black/10 bg-brand-soft/40">
      <ul className="mx-auto grid max-w-[1600px] grid-cols-2 gap-x-[15px] gap-y-[30px] px-[15px] py-[45px] md:grid-cols-4">
        {items.map(({ image, title, link }, i) => {
          const content = (
            <>
              {image ? (
                <Image
                  src={image.url}
                  alt={image.alt || title}
                  width={image.width}
                  height={image.height}
                  className="h-[72px] w-auto max-w-[110px] object-contain"
                />
              ) : null}
              {title ? <span className="text-[15px] leading-[22px] text-black">{title}</span> : null}
            </>
          );
          const cls = "flex flex-col items-center gap-[14px] text-center";
          return (
            <li key={`${title}-${i}`}>
              {link ? (
                <Link href={link} className={`${cls} hover:text-brand-accent`}>
                  {content}
                </Link>
              ) : (
                <div className={cls}>{content}</div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
