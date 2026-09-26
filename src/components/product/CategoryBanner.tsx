import { getImageProps } from "next/image";
import type { CategoryBanner as CategoryBannerData } from "@/lib/wpgraphql/tamarApi";

/**
 * Category page banner — full width, straight under the header (as on the
 * reference). Desktop image from 768px up, mobile image below (art
 * direction via <picture>, so each viewport downloads only its own image).
 * If only one of the two is set, it's used at every width.
 */
export function CategoryBanner({ banner, title }: { banner: CategoryBannerData; title: string }) {
  const desktop = banner.desktop ?? banner.mobile;
  const mobile = banner.mobile ?? banner.desktop;
  if (!desktop || !mobile) return null;

  const common = { alt: desktop.alt || title, sizes: "100vw", priority: true };
  const {
    props: { srcSet: desktopSrcSet },
  } = getImageProps({ ...common, src: desktop.url, width: desktop.width, height: desktop.height });
  const {
    props: { srcSet: mobileSrcSet, ...rest },
  } = getImageProps({ ...common, alt: mobile.alt || title, src: mobile.url, width: mobile.width, height: mobile.height });

  return (
    <picture>
      <source media="(min-width: 768px)" srcSet={desktopSrcSet} width={desktop.width} height={desktop.height} />
      {/* eslint-disable-next-line jsx-a11y/alt-text -- art-directed <picture> per the next/image docs (getImageProps); alt is in `rest` */}
      <img {...rest} srcSet={mobileSrcSet} className="block h-auto w-full" />
    </picture>
  );
}
