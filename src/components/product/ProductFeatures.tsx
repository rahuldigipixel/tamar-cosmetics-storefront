import Image from "next/image";
import Link from "next/link";
import { getFeatureIcon } from "@/lib/utils/featureIconMap";
import type { HomePageFeature } from "@/lib/wpgraphql/tamarApi";

/**
 * Icon boxes beside the gallery (2 per row) — managed in wp-admin → הגדרות
 * תמר → עמודים → Single Product Settings, in the saved order. In the RTL
 * grid the first item lands top-right, matching the reference.
 */
export function ProductFeatures({ features }: { features: HomePageFeature[] }) {
  if (features.length === 0) return null;

  return (
    <ul className="grid grid-cols-2 gap-x-[15px] gap-y-[22px] pt-[5px]">
      {features.map(({ iconType, icon, iconImage, title, subtitle, link }, i) => {
        const Icon = getFeatureIcon(icon);
        const content = (
          <>
            {iconType === "image" && iconImage ? (
              <Image
                src={iconImage.url}
                alt={iconImage.alt || title}
                width={iconImage.width || 60}
                height={iconImage.height || 60}
                className="h-[42px] w-auto max-w-[60px] object-contain"
              />
            ) : (
              <Icon className="h-[42px] w-[42px] text-brand-accent" strokeWidth={1.25} />
            )}
            <span className="max-w-[140px] text-[15px] leading-[20px] font-bold text-black" style={{ fontFamily: '"Open Sans Hebrew", sans-serif' }}>
              {title}
              {subtitle ? <> {subtitle}</> : null}
            </span>
          </>
        );

        return (
          <li key={`${title}-${i}`}>
            {link ? (
              <Link href={link} className="flex flex-col items-center gap-[10px] text-center">
                {content}
              </Link>
            ) : (
              <div className="flex flex-col items-center gap-[10px] text-center">{content}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
