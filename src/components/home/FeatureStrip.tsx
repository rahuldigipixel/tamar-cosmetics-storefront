import Image from "next/image";
import Link from "next/link";
import { Banknote, CreditCard, MessageCircle, MapPin, CalendarCheck, Lock, PackageCheck, Truck } from "lucide-react";
import { getFeatureIcon } from "@/lib/utils/featureIconMap";
import type { HomePageFeature } from "@/lib/wpgraphql/tamarApi";

const FEATURES = [
  { icon: Banknote, title: "פריסת תשלומים", subtitle: "ללא ריבית", iconImage: null, link: "" },
  { icon: CreditCard, title: "סליקת כל סוגי", subtitle: "כרטיס האשראי", iconImage: null, link: "" },
  { icon: MessageCircle, title: "שירות לקוחות", subtitle: "בוואטסאפ וטלפון", iconImage: null, link: "" },
  { icon: MapPin, title: "איסוף עצמי", subtitle: "ירושלים", iconImage: null, link: "" },
  { icon: CalendarCheck, title: "אספקה עד", subtitle: "1-4 ימי עסקים", iconImage: null, link: "" },
  { icon: Lock, title: "תשלום מאובטח", subtitle: "SSL ו-PCI", iconImage: null, link: "" },
  { icon: PackageCheck, title: "ברכישה מעל 349 ₪", subtitle: "משלוח חינם", iconImage: null, link: "" },
  { icon: Truck, title: "משלוחים", subtitle: "בכל הארץ", iconImage: null, link: "" },
] satisfies Array<{
  icon: typeof Banknote;
  title: string;
  subtitle: string;
  iconImage: HomePageFeature["iconImage"];
  link: string;
}>;

// The product page shows a shorter, purchase-relevant subset instead of the
// full 8 — delivery time, nationwide shipping, secure payment, free
// shipping — rather than duplicating the homepage's full strip verbatim.
const COMPACT_FEATURE_TITLES = ["אספקה עד", "תשלום מאובטח", "ברכישה מעל 349 ₪", "משלוחים"];

export function FeatureStrip({
  variant = "full",
  features: adminFeatures,
}: {
  variant?: "full" | "compact";
  /** Admin-managed features (wp-admin → ניהול דף הבית → רצועת יתרונות) — falls back to the hardcoded FEATURES when absent, e.g. on the product page's compact variant. */
  features?: HomePageFeature[];
}) {
  const features =
    adminFeatures && adminFeatures.length > 0
      ? adminFeatures.map((f) => ({
          icon: f.iconType === "image" ? null : getFeatureIcon(f.icon),
          iconImage: f.iconType === "image" ? f.iconImage : null,
          title: f.title,
          subtitle: f.subtitle,
          link: f.link,
        }))
      : variant === "compact"
        ? FEATURES.filter((f) => COMPACT_FEATURE_TITLES.includes(f.title))
        : FEATURES;

  return (
    <section className="my-[50px] border-y border-black/5 bg-brand-soft/30">
      <div
        className={`mx-auto grid max-w-[1600px] grid-cols-2 gap-x-4 gap-y-8 px-4 py-10 sm:px-6 ${
          variant === "compact" ? "md:grid-cols-4" : "md:grid-cols-4 lg:grid-cols-8"
        }`}
      >
        {features.map(({ icon: Icon, iconImage, title, subtitle, link }) => {
          const content = (
            <>
              <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-white text-brand-accent ring-1 ring-black/5">
                {iconImage ? (
                  <Image src={iconImage.url} alt={iconImage.alt || title} width={40} height={40} className="h-10 w-10 object-contain" />
                ) : Icon ? (
                  <Icon className="h-9 w-9" />
                ) : null}
              </span>
              <p className="max-w-[130px] text-[18px] font-bold leading-[1.2em] text-black">
                {title}
                {subtitle ? <> {subtitle}</> : null}
              </p>
            </>
          );

          return link ? (
            <Link key={title} href={link} className="flex flex-col items-center gap-2.5 text-center">
              {content}
            </Link>
          ) : (
            <div key={title} className="flex flex-col items-center gap-2.5 text-center">
              {content}
            </div>
          );
        })}
      </div>
    </section>
  );
}
