import Image from "next/image";
import Link from "next/link";
import type { ProductStripItem } from "@/lib/wpgraphql/products";

const MAX_W = 70;
const MAX_H = 60;

/**
 * Full-width icon strip under the product tabs — managed in wp-admin → הגדרות
 * עמוד מוצר. Image, title and link are each optional; only what is set renders.
 */
export function ProductIconStrip({ items }: { items: ProductStripItem[] }) {
  if (items.length === 0) return null;

  return (
    <section className="mt-[20px] w-full border-y border-black/10 bg-brand-soft/40">
      <ul className="mx-auto grid max-w-[1600px] grid-cols-2 gap-x-[15px] gap-y-[20px] px-[15px] py-[40px] md:grid-cols-4">
        {items.map(({ image, title, link }, i) => {
          // Icons are uploaded at 2x — show them at half their pixel size, capped at
          // a 70×60 box since some backends report wrong dimensions
          // (e.g. 300×300 for a 71px file), which would blow the icons up.
          const scale = image ? Math.min(1, MAX_W / (image.width / 2), MAX_H / (image.height / 2)) : 1;
          const content = (
            <>
              {image ? (
                <Image
                  src={image.url}
                  alt={image.alt || title}
                  width={image.width}
                  height={image.height}
                  style={{ width: (image.width / 2) * scale, height: (image.height / 2) * scale }}
                  className="max-w-full shrink-0 object-contain"
                />
              ) : null}
              {title ? <span className="text-[16px] leading-[21px] text-black" style={{ fontFamily: '"Open Sans Hebrew", sans-serif' }}>{title}</span> : null}
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
