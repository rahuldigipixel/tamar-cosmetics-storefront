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
    <section className="mt-0 w-full md:mt-[20px] border-y border-black/10 bg-brand-soft/40">
      <ul className="mx-auto grid max-w-[1600px] grid-cols-2 gap-x-[8px] gap-y-[12px] px-[8px] py-[16px] md:gap-x-[15px] md:gap-y-[20px] md:px-[15px] md:py-[40px] md:grid-cols-4 max-md:[&_img]:!h-auto max-md:[&_img]:!w-[44px]">
        {items.map(({ image, title, link }, i) => {
          // Icons are uploaded at 2x — show them at half their pixel size, capped at
          // a 70×60 box since some backends report wrong dimensions
          // (e.g. 300×300 for a 71px file), which would blow the icons up.
          const scale = image ? Math.min(1, MAX_W / (image.width / 2), MAX_H / (image.height / 2)) : 1;
          const content = (
            <>
              {image ? (
                <span className="flex items-center justify-center max-md:h-[50px] md:contents">
                <Image
                  src={image.url}
                  alt={image.alt || title}
                  width={image.width}
                  height={image.height}
                  style={{ width: (image.width / 2) * scale, height: (image.height / 2) * scale }}
                  className="max-w-full shrink-0 object-contain"
                />
                </span>
              ) : null}
              {title ? <span className="text-[15px] leading-[19px] text-black md:text-[16px] md:leading-[21px]" style={{ fontFamily: '"Open Sans Hebrew", sans-serif' }}>{title}</span> : null}
            </>
          );
          const cls = "flex h-full flex-col items-center gap-[8px] text-center md:gap-[14px]";
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
