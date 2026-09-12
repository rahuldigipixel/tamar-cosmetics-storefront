"use client";

import { useState } from "react";
import { Star, BadgeCheck } from "lucide-react";

interface Review {
  name: string;
  date: string;
  rating: number;
  product: string;
  text: string;
}

const REVIEWS: Review[] = [
  {
    name: "סיוון כהן",
    date: "01/09/2026",
    rating: 5,
    product: "ג'ל אלוורה טבעי 150 מ״ל | פארמקס",
    text: "מוצר מעולה, כבר מהטיפול הראשון רואים תוצאות!",
  },
  {
    name: "אילנית ערן",
    date: "05/09/2026",
    rating: 5,
    product: "ספריי מגיע קאלוס לרגליים | אמור",
    text: "מוצר מנצח - מחולל ניסים בכף הרגל, כבר מהטיפול הראשון. פשוט מדהים!",
  },
  {
    name: "טל אבן חיים",
    date: "02/09/2026",
    rating: 4,
    product: "ג'ל אולטרסאונד להסרת שיער 6 ליטר | פארמקס",
    text: "מוצר אש, בדיוק מה שחיפשתי.",
  },
  {
    name: "אילנית ערן",
    date: "06/09/2026",
    rating: 5,
    product: "ערכת פדיקור להסרת עור קשה | אמור",
    text: "תרסיס מופלא, כבר מהטיפול הראשון רואים תוצאות!",
  },
  {
    name: "סיוון כהן",
    date: "01/09/2026",
    rating: 5,
    product: "כפפות ניטריל 'שחור' מידה L",
    text: "מעולה.",
  },
  {
    name: "סיוון כהן",
    date: "01/09/2026",
    rating: 5,
    product: "מאור 240 יח' - פדיות קוסמטיות (עם סימים)",
    text: "מעולה.",
  },
];

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} מתוך 5 כוכבים`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < rating ? "fill-brand-accent text-brand-accent" : "fill-black/10 text-black/10"}`}
        />
      ))}
    </div>
  );
}

const INITIAL_COUNT = 3;

export function CustomerReviews() {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? REVIEWS : REVIEWS.slice(0, INITIAL_COUNT);
  const average = (REVIEWS.reduce((sum, r) => sum + r.rating, 0) / REVIEWS.length).toFixed(1);

  return (
    <section className=" w-full bg-white py-8 sm:py-[50px]  ">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-black sm:text-4xl">ביקורות לקוחות</h2>
          <div className="flex items-center gap-2">
            <Stars rating={Math.round(Number(average))} />
            <span className="text-lg font-semibold">{average}</span>
            <span className="text-base text-black/50">({REVIEWS.length} ביקורות)</span>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:mt-10 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((review, i) => (
            <div
              key={`${review.name}-${i}`}
              className="flex flex-col gap-2.5 rounded-2xl border border-brand-accent/10 bg-brand-soft/25 p-5 text-right shadow-sm"
            >
              <div className="flex items-center justify-between">
                <Stars rating={review.rating} />
                <span className="text-base text-black/40">{review.date}</span>
              </div>
              <p className="text-lg leading-relaxed text-black/80">{review.text}</p>
              <div className="mt-1 border-t border-black/5 pt-2.5">
                <div className="flex items-center gap-1.5">
                  <BadgeCheck className="h-4 w-4 shrink-0 text-brand-accent" />
                  <span className="font-semibold">{review.name}</span>
                </div>
                <p className="mt-0.5 line-clamp-1 text-base text-black/50">{review.product}</p>
              </div>
            </div>
          ))}
        </div>

        {REVIEWS.length > INITIAL_COUNT ? (
          <div className="mt-8 flex justify-center sm:mt-10">
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="rounded-full bg-gradient-to-l from-brand-accent to-[#ff6b72] px-4 py-1.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:from-[#ff6b72] hover:to-brand-accent hover:shadow-[0_10px_20px_-8px_rgba(213,32,39,0.5)]"
            >
              {expanded ? "הצג פחות" : "הצג ביקורות נוספות"}
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
