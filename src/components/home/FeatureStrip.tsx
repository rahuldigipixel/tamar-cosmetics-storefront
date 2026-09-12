import { Banknote, CreditCard, MessageCircle, MapPin, CalendarCheck, Lock, PackageCheck, Truck } from "lucide-react";

const FEATURES = [
  { icon: Banknote, title: "פריסת תשלומים", subtitle: "ללא ריבית" },
  { icon: CreditCard, title: "סליקת כל סוגי", subtitle: "כרטיס האשראי" },
  { icon: MessageCircle, title: "שירות לקוחות", subtitle: "בוואטסאפ וטלפון" },
  { icon: MapPin, title: "איסוף עצמי", subtitle: "ירושלים" },
  { icon: CalendarCheck, title: "אספקה עד", subtitle: "1-4 ימי עסקים" },
  { icon: Lock, title: "תשלום מאובטח", subtitle: "SSL ו-PCI" },
  { icon: PackageCheck, title: "ברכישה מעל 349 ₪", subtitle: "משלוח חינם" },
  { icon: Truck, title: "משלוחים", subtitle: "בכל הארץ" },
];

// The product page shows a shorter, purchase-relevant subset instead of the
// full 8 — delivery time, nationwide shipping, secure payment, free
// shipping — rather than duplicating the homepage's full strip verbatim.
const COMPACT_FEATURE_TITLES = ["אספקה עד", "תשלום מאובטח", "ברכישה מעל 349 ₪", "משלוחים"];

export function FeatureStrip({ variant = "full" }: { variant?: "full" | "compact" }) {
  const features =
    variant === "compact" ? FEATURES.filter((f) => COMPACT_FEATURE_TITLES.includes(f.title)) : FEATURES;

  return (
    <section className="my-[50px] border-y border-black/5 bg-brand-soft/30">
      <div
        className={`mx-auto grid max-w-[1400px] grid-cols-2 gap-x-4 gap-y-8 px-4 py-10 sm:px-6 ${
          variant === "compact" ? "md:grid-cols-4" : "md:grid-cols-4 lg:grid-cols-8"
        }`}
      >
        {features.map(({ icon: Icon, title, subtitle }) => (
          <div key={title} className="flex flex-col items-center gap-2.5 text-center">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white text-brand-accent ring-1 ring-black/5">
              <Icon className="h-6 w-6" />
            </span>
            <div>
              <p className="text-lg font-semibold leading-snug">{title}</p>
              <p className="text-base leading-snug text-black/50">{subtitle}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
